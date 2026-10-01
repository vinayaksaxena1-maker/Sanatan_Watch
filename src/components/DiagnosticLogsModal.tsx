import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Trash2, RefreshCw, Terminal, Check, Clock } from 'lucide-react';
import { EngineLogger, LiveLogEntry } from '../utils/engineLogger';
import { retryEngineInitialization } from '../utils/astronomicalEngine';

interface DiagnosticLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticLogsModal: React.FC<DiagnosticLogsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LiveLogEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'ERROR' | 'INFO'>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLogs(EngineLogger.getLiveLogs());

    const unsubscribe = EngineLogger.subscribeLiveLogs(() => {
      setLogs(EngineLogger.getLiveLogs());
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;



  const filteredLogs = logs.filter(log => {
    if (filterLevel === 'ERROR') return log.level === 'ERROR';
    if (filterLevel === 'INFO') return log.level === 'INFO';
    return true;
  });

  const handleCopyLogs = () => {
    const logText = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message} ${l.details ? `-> ${l.details}` : ''}`).join('\n');
    navigator.clipboard.writeText(logText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy logs', err);
    });
  };

  const handleClearLogs = () => {
    EngineLogger.clearLogs();
    setLogs([]);
  };

  const handleRetry = () => {
    retryEngineInitialization();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4">
      <div className="flex flex-col w-full max-w-2xl h-[85vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800/80 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
                Engine Diagnostics Log
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    SWISS EPH ACTIVE
                  </span>
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-brand-text-mut font-medium">Real-time WebWorker & WASM Execution Logs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 dark:text-brand-text-mut hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs gap-2">
          <div className="flex items-center gap-1.5">
            {(['ALL', 'INFO', 'ERROR'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  filterLevel === lvl 
                    ? 'bg-orange-500 text-white shadow-3xs' 
                    : 'bg-slate-800 text-slate-400 dark:text-brand-text-mut hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold transition-colors active:scale-95"
            >
              <RefreshCw className="w-3 h-3" />
              Re-Init Engine
            </button>

            <button
              onClick={handleCopyLogs}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-bold transition-colors active:scale-95"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              onClick={handleClearLogs}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/30 border border-slate-700 hover:border-rose-700/50 text-slate-400 dark:text-brand-text-mut hover:text-rose-300 transition-colors"
              title="Clear Logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Log Viewer Content Stream */}
        <div 
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto space-y-2 font-mono text-[11px] bg-slate-950 text-slate-300 select-text"
        >
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-brand-text-sec space-y-2">
              <Clock className="w-8 h-8 opacity-40" />
              <p className="text-xs">No logs recorded yet...</p>
            </div>
          ) : (
            filteredLogs.map(log => {
              let isError = log.level === 'ERROR';
              let isWarn = log.level === 'WARN';
              let isInfo = log.level === 'INFO';

              return (
                <div 
                  key={log.id} 
                  className={`p-2.5 rounded-xl border leading-relaxed break-all transition-colors ${
                    isError 
                      ? 'bg-rose-950/40 border-rose-800/50 text-rose-200' 
                      : isWarn 
                      ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                      : isInfo
                      ? 'bg-slate-900/90 border-slate-800 text-cyan-300'
                      : 'bg-slate-900/50 border-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[9px] font-bold text-slate-500 dark:text-brand-text-sec font-sans tracking-wider">
                      ⏱ {log.timestamp}
                    </span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                      isError ? 'bg-rose-500 text-white' : isWarn ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-cyan-400'
                    }`}>
                      {log.level}
                    </span>
                  </div>
                  <div>{log.message}</div>
                  {log.details && (
                    <div className="mt-1.5 p-2 rounded-lg bg-black/40 text-[10px] text-slate-400 dark:text-brand-text-mut border border-slate-800/80 font-mono whitespace-pre-wrap">
                      {log.details}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-400 dark:text-brand-text-mut flex items-center justify-between">
          <span>Logs count: {filteredLogs.length}</span>
          <span className="text-slate-500 dark:text-brand-text-sec font-mono">Samay Ghadi Engine v1.0</span>
        </div>

      </div>
    </div>
  );
};
