import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UploadBox from './components/UploadBox';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { Loader2, RefreshCw, Layers, Users, ChevronLeft, Plus, LogOut, ShieldCheck, User as UserIcon, Bot, ChevronRight } from 'lucide-react';
import WealthSyncWorkspace from './components/ClientChat';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000'
  : 'https://dash-etica-production.up.railway.app';

function App() {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentProfileId, setCurrentProfileId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showAgent, setShowAgent] = useState(false);

  // Auth State
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  useEffect(() => {
    if (token) {
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfiles();
    }
  }, [token]);

  const fetchProfiles = async () => {
    try {
      const response = await axios.get(`${API_BASE}/profiles`);
      setProfiles(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
      console.error('Failed to fetch profiles', err);
    }
  };

  const handleLoginSuccess = (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
    setUsername(localStorage.getItem('username'));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUsername(null);
    delete axios.defaults.headers.common['Authorization'];
    setAnalysisData(null);
    setProfiles([]);
  };

  const handleFilesAnalysis = async (files = [], transcript = null) => {
    setLoading(true);
    setError(null);
    setShowUploader(false);

    const formData = new FormData();
    if (files.length > 0) {
      files.forEach((file) => formData.append('files', file));
    }
    if (transcript) {
      formData.append('transcript', transcript);
    }

    const url = currentProfileId
      ? `${API_BASE}/analyze?profile_id=${currentProfileId}`
      : `${API_BASE}/analyze`;

    try {
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysisData(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg).join(', '));
      } else if (typeof detail === 'object' && detail !== null) {
        setError(JSON.stringify(detail));
      } else {
        setError('Analysis failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!analysisData) return;
    setIsSaving(true);
    try {
      const name = analysisData.client_profile.name || `Client_${Date.now()}`;
      const response = await axios.post(`${API_BASE}/save_profile`, {
        name: name,
        data: analysisData
      });
      setCurrentProfileId(response.data.id);
      fetchProfiles();
      alert('Profile saved successfully!');
    } catch (err) {
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const loadProfile = async (id) => {
    setLoading(true);
    setCurrentProfileId(id);
    setShowHistory(false);
    setShowUploader(false);
    try {
      const response = await axios.get(`${API_BASE}/profiles/${id}`);
      setAnalysisData(response.data);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysisData(null);
    setError(null);
    setCurrentProfileId(null);
    setShowUploader(false);
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar for History */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 z-50 overflow-hidden ${showHistory ? 'w-80' : 'w-0'}`}>
        <div className="w-80 p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4" /> Client Database
            </h3>
            <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-2">
            {profiles.length === 0 && <p className="text-slate-400 text-sm italic py-4">No profiles found.</p>}
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => loadProfile(p.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${currentProfileId === p.id ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-slate-50 border-slate-100 hover:bg-white text-slate-600'}`}
              >
                <div className="flex justify-between items-start">
                  <p className="font-bold text-sm truncate pr-2">{p.name}</p>
                  {role === 'admin' && (
                    <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 rounded uppercase font-bold">
                      {p.owner}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{new Date(p.created_at).toLocaleDateString()}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => { reset(); setShowHistory(false); }}
            className="mt-6 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-primary-400 hover:text-primary-600 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New Profile
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-lg transition-all ${showHistory ? 'bg-primary-50 text-primary-600' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <Users className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 cursor-pointer group" onClick={reset}>
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">WealthSync</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                {role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <UserIcon className="w-4 h-4 text-blue-600" />
                )}
                <span className="text-xs font-bold text-slate-700 capitalize pr-1">{role}: {username}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {analysisData && (
                <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                  <button
                    onClick={() => setShowAgent(!showAgent)}
                    className={`p-2 rounded-lg transition-all ${showAgent ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}
                    title="Agent Manager"
                  >
                    <Bot className="w-5 h-5" />
                  </button>
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> New Analysis
                  </button>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto py-12 px-6">
          {(!analysisData || showUploader) ? (
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {showUploader ? `Adding details for ${analysisData.client_profile.name}` : 'AI Relationship Manager'}
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                  {showUploader
                    ? 'Upload additional documents to refine this client\'s profile.'
                    : 'Upload financial documents, photos, or meeting recordings to generate an analysis.'}
                </p>
                {showUploader && (
                  <button onClick={() => setShowUploader(false)} className="text-primary-600 font-semibold text-sm">
                    ← Back to Dashboard
                  </button>
                )}
              </div>

              <UploadBox onFilesSelected={handleFilesAnalysis} isLoading={loading} />

              {error && (
                <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  {error}
                </div>
              )}
            </div>
          ) : (
            <Dashboard
              data={analysisData}
              onSave={handleSaveProfile}
              onAddMore={() => setShowUploader(true)}
              isSaving={isSaving}
              profileId={currentProfileId}
            />
          )}

          {loading && !analysisData && (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                <p className="font-bold text-slate-900 text-xl">Analyzing Data...</p>
                <p className="text-slate-500 mt-2">Gemini 3 Flash is processing your request.</p>
              </div>
            </div>
          )}
        </main>

        <footer className="py-8 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
            WealthSync AI • {role === 'admin' ? 'Administrative Access' : 'Relationship Manager Portal'}
          </div>
        </footer>
      </div>

      {/* Sidebar for Agent Manager */}
      <aside className={`bg-white border-l border-slate-200 transition-all duration-300 z-50 overflow-hidden h-screen ${showAgent ? 'w-[480px]' : 'w-0'}`}>
        <div className="w-[480px] h-full flex flex-col">
          {analysisData && (
            <WealthSyncWorkspace
              profileId={currentProfileId}
              analysisData={analysisData}
              clientName={analysisData.client_profile?.name || 'Client'}
              onClose={() => setShowAgent(false)}
            />
          )}
        </div>
      </aside>
    </div>
  );
}

export default App;
