import React, { useState, useEffect, useRef } from 'react';
import {
    Send, Bot, User, Loader2, Sparkles,
    Plus, History, MoreHorizontal, X,
    Mic, ArrowUp, Zap, ChevronDown,
    LayoutPanelLeft, Search, Clock,
    MessageCircle, Trash2, Globe, ShieldCheck
} from 'lucide-react';
import axios from 'axios';

const WealthSyncWorkspace = ({ profileId, analysisData, clientName, onClose }) => {
    const [selectedModel, setSelectedModel] = useState('Gemini 3.1 Pro (Latest)');
    const [showModelMenu, setShowModelMenu] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `I've synchronized with ${clientName}'s financial profile. I have active analysis on their net worth, tax liabilities, and recent meeting transcripts. How can I assist you with this client today?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/chat', {
                profile_id: profileId,
                context: profileId ? null : analysisData,
                message: input,
                model: selectedModel
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "System connection interrupted. Please verify the AI Vault status."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full bg-white flex flex-col overflow-hidden">
            {/* Header - Mimicking Antigravity / Cursor Sidebar */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Bot className="w-4 h-4 text-slate-700" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 tracking-tight">AI-Powered Client Insights</span>
                        <span className="text-[10px] text-slate-400 font-medium">WealthSync Agent • Online</span>
                    </div>
                </div>
                <div className="flex items-center gap-0.5">
                    <SidebarAction icon={<Plus className="w-4 h-4" />} />
                    <SidebarAction icon={<Clock className="w-4 h-4" />} />
                    <SidebarAction icon={<MoreHorizontal className="w-4 h-4" />} />
                    <div className="w-[1px] h-4 bg-slate-200 mx-2" />
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chat Body - The "Antigravity/Cursor" Layout */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-10 custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={idx} className="space-y-4">
                        <div className="flex items-center gap-2 group">
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${msg.role === 'assistant' ? 'bg-slate-900' : 'bg-slate-100'
                                }`}>
                                {msg.role === 'assistant' ? (
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                ) : (
                                    <User className="w-3.5 h-3.5 text-slate-600" />
                                )}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                {msg.role === 'assistant' ? 'Intelligence' : 'RM'}
                            </span>
                            {msg.role === 'assistant' && (
                                <div className="hidden group-hover:flex items-center gap-2 ml-auto">
                                    <button className="text-[10px] font-bold text-slate-300 hover:text-slate-500">Copy</button>
                                    <button className="text-[10px] font-bold text-slate-300 hover:text-slate-500">Draft</button>
                                </div>
                            )}
                        </div>
                        <div className="pl-8">
                            <div className={`text-[15px] leading-relaxed ${msg.role === 'user' ? 'text-slate-900 font-semibold' : 'text-slate-700 font-normal'
                                }`}>
                                {msg.content.split('\n').map((line, i) => (
                                    <p key={i} className={i > 0 ? 'mt-4' : ''}>{line}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center">
                                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Intelligence</span>
                        </div>
                        <div className="pl-8 space-y-2">
                            <div className="h-3 bg-slate-50 rounded-full w-4/5 animate-pulse" />
                            <div className="h-3 bg-slate-50 rounded-full w-2/3 animate-pulse" />
                            <div className="h-3 bg-slate-50 rounded-full w-3/4 animate-pulse" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Footer - Precise Recreation of User's Screenshot 2 */}
            <div className="flex-shrink-0 p-5 border-t border-slate-50 bg-white z-10">
                <form onSubmit={handleSend} className="relative bg-slate-50 rounded-2xl border border-slate-200/60 p-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/40 transition-all">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Ask anything about ${clientName}...`}
                        rows={3}
                        className="w-full bg-transparent border-none px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:ring-0 resize-none min-h-[90px]"
                    />

                    <div className="flex items-center justify-between px-3 pb-2 pt-1">
                        <div className="flex items-center gap-1">
                            <ActionIconButton icon={<Plus className="w-4 h-4" />} />
                            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                            <ToolButton icon={<Zap className="w-3.5 h-3.5 text-amber-500" />} label="Fast" />
                            <div className="relative">
                                <ToolButton
                                    icon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                                    label={selectedModel}
                                    hasChevron
                                    onClick={() => setShowModelMenu(!showModelMenu)}
                                />
                                {showModelMenu && (
                                    <>
                                        <div className="fixed inset-0 z-[2999]" onClick={() => setShowModelMenu(false)} />
                                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-[3000] animate-in slide-in-from-bottom-2 duration-200">
                                            {[
                                                'Gemini 3.1 Pro (Latest)',
                                                'Gemini 3 Flash',
                                                'Gemini 2.5 Pro',
                                                'Gemini 2.5 Flash',
                                                'o3-mini (OpenAI Reasoning)',
                                                'o1 (High Logic)',
                                                'GPT-4o (Standard)',
                                                'Claude 3.5 Sonnet',
                                                'Qwen Max'
                                            ].map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => {
                                                        setSelectedModel(m);
                                                        setShowModelMenu(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ActionIconButton icon={<Mic className="w-4 h-4" />} />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 disabled:opacity-20 transition-all shadow-md active:scale-95"
                            >
                                <ArrowUp className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form>

                <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Worldwide Search</div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> High Precision</div>
                </div>
            </div>
        </div>
    );
};

// Reusable Sub-components
const SidebarAction = ({ icon }) => (
    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
        {icon}
    </button>
);

const ActionIconButton = ({ icon }) => (
    <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all">
        {icon}
    </button>
);

const ToolButton = ({ icon, label, hasChevron = false, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all"
    >
        {icon}
        {label}
        {hasChevron && <ChevronDown className="w-3 h-3 text-slate-400" />}
    </button>
);

export default WealthSyncWorkspace;
