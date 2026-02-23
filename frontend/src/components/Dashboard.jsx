import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import {
    TrendingUp, Wallet, Target, AlertCircle, ChevronRight,
    User, Shield, BarChart3, LayoutDashboard, Gem, Home, CreditCard, Star,
    MessageSquare, Mic, Calendar, Activity, Bot
} from 'lucide-react';

import ClientProfileCard from './ClientProfileCard';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = ({ data, onSave, onAddMore, isSaving, profileId }) => {
    if (!data) return null;

    const {
        client_profile = {},
        client_personal_details = {},
        financial_snapshot = {},
        goals_detected = [],
        key_risks = [],
        strategic_roadmap = [],
        portfolio_allocation = [],
        assets_detail = [],
        insurance_analysis = {},
        meeting_analysis = null
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
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-700 pb-20 relative">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 serif-font italic">WealthSync Intelligence</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-slate-500">Analysis for {client_profile.name || 'Client'}</p>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-bold border border-indigo-100">
                            Potential Rank
                        </span>
                        {renderRankStars(client_profile.potential_rank || 0)}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => onAddMore()}
                        className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                    >
                        Add Data
                    </button>
                    <button
                        onClick={() => onSave()}
                        disabled={isSaving}
                        className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </div>

            {/* Client Personal Profile Section */}
            <ClientProfileCard personalDetails={client_personal_details} />

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard icon={<Wallet />} label="Net Worth" value={financial_snapshot.net_worth} color="primary" />
                <MetricCard icon={<TrendingUp />} label="Investable Assets" value={financial_snapshot.total_assets_value || 'N/A'} color="emerald" />
                <MetricCard icon={<CreditCard />} label="Monthly Burn" value={financial_snapshot.monthly_burn} color="rose" />
                <MetricCard icon={<BarChart3 />} label="Savings Rate" value={financial_snapshot.savings_rate} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Analysis Column */}
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

                    {/* Assets Breakdown */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <Gem className="w-5 h-5 text-indigo-500" /> Portfolio Breakdown
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
                                                        Total Value
                                                    </p>
                                                    <p className="text-xl font-black text-primary-600 leading-none">{categoryTotal}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {items.map((item, idx) => (
                                                <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                                    <p className="text-lg font-bold text-slate-900">{item.value}</p>
                                                    <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Meeting Analysis */}
                    {meeting_analysis && (
                        <div className="glass-card p-6 border-l-4 border-l-indigo-500">
                            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                                <Mic className="w-5 h-5 text-indigo-500" /> Transcription Insights
                            </h3>
                            <div className="space-y-6">
                                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                    <p className="text-slate-700 leading-relaxed text-sm italic">"{meeting_analysis.transcript_summary}"</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {meeting_analysis.speakers?.map((speaker, idx) => (
                                        <div key={idx} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <p className="font-bold text-slate-900 text-sm mb-2">{speaker.name} ({speaker.role})</p>
                                            <ul className="space-y-1.5">
                                                {speaker.key_points?.map((point, pIdx) => (
                                                    <li key={pIdx} className="text-xs text-slate-600 flex items-start gap-2">
                                                        <div className="mt-1.5 w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Intelligence Column */}
                <div className="space-y-8">
                    {/* Insurance Card */}
                    {Object.keys(insurance_analysis).length > 0 && (
                        <div className="glass-card p-6 border-t-4 border-t-blue-500">
                            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-500" /> Protection Analysis
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-slate-700 uppercase">Life Insurance</span>
                                        <ProtectionBadge isSufficient={insurance_analysis.life_insurance?.is_sufficient} />
                                    </div>
                                    <p className="text-lg font-bold text-slate-900">{insurance_analysis.life_insurance?.coverage_amount}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{insurance_analysis.life_insurance?.gap_details}</p>
                                </div>

                                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-slate-700 uppercase">Health Insurance</span>
                                        <ProtectionBadge isSufficient={insurance_analysis.health_insurance?.is_sufficient} />
                                    </div>
                                    <p className="text-lg font-bold text-slate-900">{insurance_analysis.health_insurance?.coverage_amount}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{insurance_analysis.health_insurance?.gap_details}</p>
                                </div>

                                <div className="mt-6 p-4 bg-slate-900 rounded-xl text-white text-xs leading-relaxed italic border border-slate-800">
                                    "{insurance_analysis.rm_suggestion}"
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Goals Card */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary-500" /> Targeted Benchmarks
                        </h3>
                        <div className="space-y-4">
                            {goals_detected.map((goal, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{goal.goal}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Timeline: {goal.timeline}</p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${goal.feasibility === 'High' ? 'bg-emerald-100 text-emerald-700' :
                                        goal.feasibility === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {goal.feasibility}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risks Card */}
                    <div className="glass-card p-6 border-t-4 border-t-red-500">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" /> Exposure Risks
                        </h3>
                        <ul className="space-y-3">
                            {key_risks.map((risk, idx) => (
                                <li key={idx} className="text-xs text-slate-600 bg-red-50/30 p-3 rounded-lg flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {risk}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Strategic Roadmap */}
            <div className="glass-card p-8 border-indigo-100/50">
                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <ChevronRight className="w-6 h-6 text-indigo-500" /> Executive Roadmap
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {strategic_roadmap.map((step, idx) => (
                        <div key={idx} className="relative group">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4 border border-indigo-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {step.step}
                            </div>
                            <h4 className="font-bold text-slate-900 mb-2">{step.action}</h4>
                            <p className="text-sm text-slate-500 line-clamp-3">{step.reasoning}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper Components
const MetricCard = ({ icon, label, value, color }) => (
    <div className={`glass-card p-6 border-l-4 ${color === 'primary' ? 'border-l-indigo-500' :
        color === 'emerald' ? 'border-l-emerald-500' :
            color === 'rose' ? 'border-l-rose-500' : 'border-l-amber-500'
        }`}>
        <div className="flex items-center gap-3 text-slate-500 mb-2">
            {React.cloneElement(icon, { className: 'w-4 h-4' })}
            <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
);

const ProtectionBadge = ({ isSufficient }) => (
    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${isSufficient ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>
        {isSufficient ? 'Sufficient' : 'Underweight'}
    </span>
);

export default Dashboard;
