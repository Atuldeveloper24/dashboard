import os
import io
import json
import tempfile
import datetime
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pypdf import PdfReader
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

load_dotenv()

# --- Configuration ---
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-jwt-change-it-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

# --- Database Setup ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, "wealthsync.db")
DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Auth Context ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- Models ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="employee") # admin or employee
    profiles = relationship("ClientProfile", back_populates="owner")

class ClientProfile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    data = Column(Text) # JSON stored as string
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    owner = relationship("User", back_populates="profiles")

Base.metadata.create_all(bind=engine)

# --- Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserOut(BaseModel):
    id: int
    username: str
    role: str

# --- Gemini Setup ---
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")
genai.configure(api_key=api_key)

app = FastAPI(title="WealthSync API v3 - Auth & RBAC")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dash-etica.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Utilities ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

def extract_pdf_text(file_content: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""

# --- Auth Routes ---
@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "username": user.username}

# --- Data Routes ---
@app.get("/profiles")
def list_profiles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "admin":
        profiles = db.query(ClientProfile).all()
    else:
        profiles = db.query(ClientProfile).filter(ClientProfile.owner_id == current_user.id).all()
    
    return [{"id": p.id, "name": p.name, "created_at": p.created_at, "owner": p.owner.username if p.owner else "System"} for p in profiles]

@app.post("/analyze")
async def analyze_financial_data(
    files: List[UploadFile] = File(...), 
    profile_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_context = ""
    
    if profile_id:
        profile = db.query(ClientProfile).filter(ClientProfile.id == profile_id).first()
        if profile:
            # Check permission
            if current_user.role != "admin" and profile.owner_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized to access this profile")
            existing_context = f"\nEXISTING CLIENT DATA (CONTEXT):\n{profile.data}\n"

    try:
        prompt_parts = [
            f"""You are an elite Wealth Manager. Analyze the attached client documents, whiteboard photos, and audio. 
            {"Incorporate these new details into the existing client profile provided below." if profile_id else "Create a new comprehensive financial analysis."}
            
            Output a comprehensive financial analysis in strict JSON format.
            You must detect specific assets like Mutual Funds, Jewellery, Properties, and SIPs if mentioned.
            You must also calculate a 'potential_rank' (1-10) based on their net worth, assets, and investable surplus.

            REQUIRED JSON STRUCTURE:
            {{
              "client_profile": {{ "name": "String", "risk_tolerance": "Conservative/Moderate/Aggressive", "life_stage": "String", "potential_rank": number }},
              "financial_snapshot": {{ "net_worth": "String", "monthly_burn": "String", "savings_rate": "String", "total_assets_value": "String" }},
              "assets_detail": [
                {{ "type": "Mutual Fund/Property/Jewellery/SIP", "value": "String", "description": "String" }}
              ],
              "category_totals": [
                {{ "type": "String", "total_value": "String" }}
              ],
              "note_on_totals": "For SIPs, total_value should be the SUM of monthly amounts (e.g., '50,000/month'). Do NOT multiply monthly amounts by assumed tenures to create large 'Lakh' values unless explicitly stated in documents.",
              "goals_detected": [
                {{ "goal": "String", "timeline": "String", "feasibility": "High/Medium/Low" }}
              ],
              "key_risks": ["Risk 1", "Risk 2"],
              "strategic_roadmap": [
                {{ "step": "1", "action": "String", "reasoning": "String" }}
              ],
              "portfolio_allocation": [
                 {{ "category": "String", "percentage": number }}
              ],
              "insurance_analysis": {{
                "life_insurance": {{ "status": "Detected/Not Found", "coverage_amount": "String", "is_sufficient": boolean, "gap_details": "String" }},
                "health_insurance": {{ "status": "Detected/Not Found", "coverage_amount": "String", "is_sufficient": boolean, "gap_details": "String" }},
                "rm_suggestion": "String"
              }}
            }}
            
            {existing_context}
            """,
            "\n\nNEW DATA extracted from files:\n"
        ]
        
        for file in files:
            content_type = file.content_type
            filename = file.filename.lower()
            file_bytes = await file.read()
            
            # Handle Images (Directly via PIL)
            if any(filename.endswith(ext) for ext in [".png", ".jpg", ".jpeg"]) or content_type.startswith("image/"):
                img = Image.open(io.BytesIO(file_bytes))
                prompt_parts.append(img)
                prompt_parts.append(f"\nImage: {filename}\n")
            
            # Handle PDFs and Audio (Using File API for multimodal processing)
            elif filename.endswith(".pdf") or content_type == "application/pdf" or \
                 any(filename.endswith(ext) for ext in [".mp3", ".wav", ".m4a", ".aac"]) or content_type.startswith("audio/"):
                
                suffix = os.path.splitext(filename)[1]
                # Fallback suffix if splitext fails
                if not suffix:
                    suffix = ".pdf" if "pdf" in content_type else ".mp3"
                
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                    tmp.write(file_bytes)
                    tmp_path = tmp.name
                
                try:
                    uploaded_file = genai.upload_file(path=tmp_path, display_name=filename)
                    prompt_parts.append(uploaded_file)
                finally:
                    if os.path.exists(tmp_path): 
                        os.remove(tmp_path)
            
            # Generic text fallback (like TXT files if any)
            else:
                try:
                    text_content = file_bytes.decode("utf-8")
                    prompt_parts.append(f"Content from {filename}:\n{text_content}\n")
                except:
                    pass

        model = genai.GenerativeModel(
            model_name="gemini-3-flash-preview",
            generation_config={"response_mime_type": "application/json"}
        )

        response = model.generate_content(prompt_parts)
        res_text = response.text
        if "```json" in res_text:
            res_text = res_text.split("```json")[1].split("```")[0].strip()
        elif "```" in res_text:
            res_text = res_text.split("```")[1].strip()
            
        analysis_data = json.loads(res_text)
        return analysis_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save_profile")
def save_profile(
    name: str = Body(..., embed=True), 
    data: dict = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if profile with this name exists for this user
    profile = db.query(ClientProfile).filter(
        ClientProfile.name == name,
        ClientProfile.owner_id == current_user.id
    ).first()
    
    if profile:
        profile.data = json.dumps(data)
    else:
        profile = ClientProfile(name=name, data=json.dumps(data), owner_id=current_user.id)
        db.add(profile)
    
    db.commit()
    db.refresh(profile)
    return {"id": profile.id, "message": "Profile saved successfully"}

@app.get("/profiles/{profile_id}")
def get_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ClientProfile).filter(ClientProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Check permission
    if current_user.role != "admin" and profile.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this profile")
        
    return json.loads(profile.data)

# --- Seed Script ---
def seed_data():
    db = SessionLocal()
    # Create Admin
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin = User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin)
    
    # Create Employee
    emp = db.query(User).filter(User.username == "employee1").first()
    if not emp:
        emp = User(
            username="employee1",
            hashed_password=get_password_hash("emp123"),
            role="employee"
        )
        db.add(emp)
    
    # Create Employee 2
    emp2 = db.query(User).filter(User.username == "employee2").first()
    if not emp2:
        emp2 = User(
            username="employee2",
            hashed_password=get_password_hash("emp456"),
            role="employee"
        )
        db.add(emp2)
    
    db.commit()
    db.close()

if __name__ == "__main__":
    import uvicorn
    seed_data()
    uvicorn.run(app, host="0.0.0.0", port=8000)
