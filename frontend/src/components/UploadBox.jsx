import React, { useState, useCallback } from 'react';
import { Upload, FileText, Smartphone, Music, Video, Loader2, X } from 'lucide-react';

const UploadBox = ({ onFilesSelected, isLoading }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [transcript, setTranscript] = useState('');
    const [uploadMode, setUploadMode] = useState('files'); // 'files' or 'transcript'

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files);
            setSelectedFiles(prev => [...prev, ...files]);
        }
    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const files = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...files]);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (uploadMode === 'files' && selectedFiles.length > 0) {
            onFilesSelected(selectedFiles, transcript || null);
        } else if (uploadMode === 'transcript' && transcript.trim()) {
            onFilesSelected(selectedFiles, transcript);
        }
    };

    const getFileIcon = (file) => {
        if (file.type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        if (file.type.includes('image')) return <Smartphone className="w-5 h-5 text-blue-500" />;
        if (file.type.includes('audio')) return <Music className="w-5 h-5 text-purple-500" />;
        if (file.type.includes('video')) return <Video className="w-5 h-5 text-indigo-500" />;
        return <FileText className="w-5 h-5 text-slate-500" />;
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            {/* Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                <button
                    onClick={() => setUploadMode('files')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${uploadMode === 'files' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Upload className="w-4 h-4" /> Documents & Recordings
                </button>
                <button
                    onClick={() => setUploadMode('transcript')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${uploadMode === 'transcript' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FileText className="w-4 h-4" /> Paste Transcript
                </button>
            </div>

            {uploadMode === 'files' ? (
                <div
                    className={`upload-zone ${dragActive ? 'border-primary-500 bg-primary-50/50' : 'bg-white'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload').click()}
                >
                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleChange}
                        accept=".pdf,.png,.jpg,.jpeg,.mp3,.wav,.m4a,.mp4,.mov"
                    />

                    <div className="bg-primary-50 p-4 rounded-full mb-4">
                        <Upload className="w-8 h-8 text-primary-600" />
                    </div>

                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        Drop your documents or recordings
                    </h3>
                    <p className="text-slate-500 text-center max-w-sm">
                        Upload PDF statements, whiteboard photos, or meeting recordings.
                    </p>

                    <div className="mt-6 flex gap-4 text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> PDF</span>
                        <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Images</span>
                        <span className="flex items-center gap-1"><Music className="w-3 h-3" /> Audio</span>
                        <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>
                    </div>
                </div>
            ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary-50 p-3 rounded-xl">
                            <FileText className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Paste Meeting Minutes</h3>
                            <p className="text-sm text-slate-500">The AI will extract assets, goals, and speaker points from this text.</p>
                        </div>
                    </div>
                    <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Paste your Zoom meeting transcript or discussion minutes here..."
                        className="w-full h-48 p-4 rounded-2xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none text-slate-700 font-medium"
                    />
                </div>
            )}

            {(selectedFiles.length > 0 || (uploadMode === 'transcript' && transcript.trim())) && (
                <div className="glass-card p-6 space-y-4">
                    {selectedFiles.length > 0 && (
                        <>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <h4 className="font-medium text-slate-700">Selected Files ({selectedFiles.length})</h4>
                                <button
                                    onClick={() => setSelectedFiles([])}
                                    className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="space-y-2">
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(file)}
                                            <div>
                                                <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{file.name}</p>
                                                <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                            className="p-1 hover:bg-slate-200 rounded-lg text-slate-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing data...</>
                        ) : (
                            'Analyze Data with WealthSync AI'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadBox;
