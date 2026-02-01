import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import {
    TrendingUp, Wallet, Target, AlertCircle, ChevronRight,
    User, Shield, BarChart3, LayoutDashboard, Gem, Home, CreditCard, Star
} from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = ({ data, onSave, onAddMore, isSaving }) => {
    if (!data) return null;

    const {
        client_profile = {},
        financial_snapshot = {},
        goals_detected = [],
        key_risks = [],
        strategic_roadmap = [],
        portfolio_allocation = [],
        assets_detail = [],
        insurance_analysis = {}
    } = data;

    const renderRankStars = (rank) => {
        return (
            <div className="flex items-center gap-1">
                {[...Array(10)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rank ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                    />
                ))}
                <span className="ml-2 font-bold text-slate-700">{rank}/10</span>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">WealthSync Analysis</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-slate-500">Wealth profile for {client_profile.name || 'Client'}</p>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-bold border border-indigo-100">
                            Potential Rank
                        </span>
                        {renderRankStars(client_profile.potential_rank || 0)}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => onAddMore()}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                    >
                        Add More Data
                    </button>
                    <button
                        onClick={() => onSave()}
                        disabled={isSaving}
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-200 transition-all disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                    <div className="flex gap-1 items-center ml-2 border-l border-slate-200 pl-4">
                        <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium border border-primary-100">
                            {client_profile.risk_tolerance}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                            {client_profile.life_stage}
                        </span>
                    </div>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 border-l-4 border-l-primary-500">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <Wallet className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Net Worth</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{financial_snapshot.net_worth}</p>
                </div>
                <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Investable Assets</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{financial_snapshot.total_assets_value || 'N/A'}</p>
                </div>
                <div className="glass-card p-6 border-l-4 border-l-rose-500">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Burn</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{financial_snapshot.monthly_burn}</p>
                </div>
                <div className="glass-card p-6 border-l-4 border-l-amber-500">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Savings Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{financial_snapshot.savings_rate}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Portfolio Allocation */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <LayoutDashboard className="w-5 h-5 text-primary-500" /> Portfolio Allocation
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={portfolio_allocation}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="percentage"
                                        nameKey="category"
                                    >
                                        {portfolio_allocation.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ReTooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Assets Detail Section (Grouped with Totals) */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <Gem className="w-5 h-5 text-indigo-500" /> Asset Portfolio Breakdown
                        </h3>
                        <div className="space-y-10">
                            {Object.entries(
                                assets_detail.reduce((acc, asset) => {
                                    const type = asset.type.toUpperCase();
                                    if (!acc[type]) acc[type] = [];
                                    acc[type].push(asset);
                                    return acc;
                                }, {})
                            ).map(([type, items], groupIdx) => {
                                const categoryTotal = data.category_totals?.find(t => t.type.toUpperCase().includes(type) || type.includes(t.type.toUpperCase()))?.total_value;
                                return (
                                    <div key={groupIdx} className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary-50 rounded-xl">
                                                    {type.includes('PROPERTY') ? <Home className="w-5 h-5 text-primary-600" /> :
                                                        type.includes('MUTUAL') ? <BarChart3 className="w-5 h-5 text-primary-600" /> :
                                                            <Gem className="w-5 h-5 text-primary-600" />}
                                                </div>
                                                <h4 className="text-md font-bold text-slate-800 tracking-tight uppercase">{type}</h4>
                                            </div>
                                            {categoryTotal && (
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                                                        {type.includes('SIP') ? 'Total Monthly Commitment' : 'Total Category Value'}
                                                    </p>
                                                    <p className="text-xl font-black text-primary-600 leading-none">{categoryTotal}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {items.map((item, idx) => (
                                                <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <p className="text-lg font-bold text-slate-900 leading-tight">{item.value}</p>
                                                            <p className="text-sm text-slate-500 font-medium leading-normal">{item.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {assets_detail.length === 0 && (
                                <p className="text-slate-400 text-sm italic">No specific asset breakdowns detected yet.</p>
                            )}
                        </div>
                    </div>


                    {/* Strategic Roadmap */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <ChevronRight className="w-5 h-5 text-primary-500" /> Strategic Roadmap
                        </h3>
                        <div className="space-y-6">
                            {strategic_roadmap.map((step, idx) => (
                                <div key={idx} className="relative pl-12 pb-6 last:pb-0">
                                    {idx !== strategic_roadmap.length - 1 && (
                                        <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-slate-100" />
                                    )}
                                    <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-primary-50 border-2 border-primary-500 flex items-center justify-center text-primary-700 font-bold">
                                        {step.step}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{step.action}</h4>
                                        <p className="text-sm text-slate-500 mt-1">{step.reasoning}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Insurance Analysis */}
                    {insurance_analysis && (
                        <div className="glass-card p-6 border-t-4 border-t-blue-500">
                            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-500" /> Insurance & Protection
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold text-slate-700 uppercase">Life Insurance</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${insurance_analysis.life_insurance?.is_sufficient ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {insurance_analysis.life_insurance?.is_sufficient ? 'Sufficient' : 'Inadequate'}
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-slate-900">{insurance_analysis.life_insurance?.coverage_amount || 'Not Found'}</p>
                                    <p className="text-xs text-slate-500 mt-1 italic">{insurance_analysis.life_insurance?.gap_details}</p>
                                </div>

                                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold text-slate-700 uppercase">Health Insurance</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${insurance_analysis.health_insurance?.is_sufficient ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {insurance_analysis.health_insurance?.is_sufficient ? 'Sufficient' : 'Inadequate'}
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-slate-900">{insurance_analysis.health_insurance?.coverage_amount || 'Not Found'}</p>
                                    <p className="text-xs text-slate-500 mt-1 italic">{insurance_analysis.health_insurance?.gap_details}</p>
                                </div>

                                <div className="mt-6 p-4 bg-slate-900 rounded-2xl shadow-xl border border-slate-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="w-3 h-3 text-primary-400" />
                                        <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">RM Strategy Note</p>
                                    </div>
                                    <p className="text-sm text-slate-100 leading-relaxed font-medium italic">
                                        "{insurance_analysis.rm_suggestion}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Goals */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary-500" /> Detected Goals
                        </h3>
                        <div className="space-y-4">
                            {goals_detected.map((goal, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-slate-900">{goal.goal}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${goal.feasibility === 'High' ? 'bg-emerald-100 text-emerald-700' :
                                            goal.feasibility === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {goal.feasibility}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium tracking-tight uppercase">Timeline: {goal.timeline}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risks */}
                    <div className="glass-card p-6 border-t-4 border-t-red-500">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" /> Key Risks
                        </h3>
                        <ul className="space-y-3">
                            {key_risks.map((risk, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 bg-red-50/50 p-3 rounded-lg border border-red-100/50">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {risk}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
