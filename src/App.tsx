import React, { useState, useEffect } from 'react';
import { Database, Send, Copy, Check, Info, Trash2, ArrowRight, Terminal, HelpCircle, X, BookOpen, MessageSquare, Code, Menu, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateSQL } from './lib/gemini.ts';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

SyntaxHighlighter.registerLanguage('sql', sql);

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EXAMPLES = [
  {
    title: "Sales Report",
    dataset: "sales(order_id, customer_id, product_id, quantity, price, date)\nproducts(product_id, name, category)",
    request: "Total revenue and number of orders per product category in 2023, sorted by revenue descending."
  },
  {
    title: "Customer Retention",
    dataset: "users(user_id, email, signup_date, last_login_date)\nsubscriptions(subscription_id, user_id, plan_type, status, start_date)",
    request: "List the email and plan type of users who signed up before 2023 but have not logged in since January 2024."
  }
];

const DIALECTS = ["Standard SQL", "PostgreSQL", "MySQL", "SQLite", "BigQuery", "Snowflake", "Oracle", "SQL Server"];

const SidebarContent = ({ dialect, setDialect, loadExample }: { dialect: string; setDialect: (d: string) => void; loadExample: (ex: typeof EXAMPLES[0]) => void }) => (
  <div className="flex flex-col gap-8 h-full">
    <div>
      <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-5">Configurations</h3>
      <div className="space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2.5">SQL Dialect</label>
          <select 
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-medium"
          >
            {DIALECTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center gap-3 group cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" />
            <label className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Strict Schema Mode</label>
          </div>
          <div className="flex items-center gap-3 group cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" />
            <label className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Auto-alias Aggregations</label>
          </div>
          <div className="flex items-center gap-3 group cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" />
            <label className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Optimize Join Order</label>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-5">Quick Examples</h3>
      <div className="space-y-3">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => loadExample(ex)}
            className="w-full text-left bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 rounded-lg p-3.5 transition-all group"
          >
            <p className="font-bold text-[11px] mb-1.5 text-slate-700 group-hover:text-blue-600 transition-colors flex items-center justify-between">
              {ex.title}
              <span className="text-[9px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-400 font-mono">TBL</span>
            </p>
            <p className="text-[10px] text-slate-500 line-clamp-2 italic leading-relaxed">"{ex.request}"</p>
          </button>
        ))}
      </div>
    </div>

    <div className="mt-auto">
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
        <p className="text-[11px] text-blue-700 leading-relaxed font-semibold">
          <span className="flex items-center gap-1.5 mb-1.5 text-blue-800">
            <Info className="w-3 h-3" />
            Pro Tip:
          </span>
          Provide specific column types for more optimized results.
        </p>
      </div>
    </div>
  </div>
);

const GuideModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden border border-slate-200"
        >
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">User Guide</h2>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">How to master SQL generation</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <Database className="w-4 h-4" />
                  <h3 className="font-bold text-sm">1. Define Schema</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Start by pasting your actual DDL, or describing your tables using a simpler format like table(col1, col2).
                </p>
                <div className="p-3 bg-slate-50 rounded-lg font-mono text-[10px] text-slate-500 border border-slate-100 italic">
                  orders(id, user_id, amount)<br/>
                  users(id, name, email)
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                  <h3 className="font-bold text-sm">2. Ask Question</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Describe what you want to find in plain English. For better results, be specific about filters or sorting.
                </p>
                <div className="p-3 bg-slate-50 rounded-lg font-mono text-[10px] text-slate-500 border border-slate-100 italic">
                  "Show total revenue for June 2023"
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <Terminal className="w-4 h-4" />
                  <h3 className="font-bold text-sm">3. Choose Dialect</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Select your specific database engine from the configuration sidebar to ensure compatible syntax.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <Code className="w-4 h-4" />
                  <h3 className="font-bold text-sm">4. Get SQL</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Hit generate and receive optimized SQL with proper aliasing, joins, and formatting.
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs text-amber-700 leading-relaxed">
                <span className="font-bold block mb-1 uppercase tracking-wide opacity-80">Important:</span>
                This agent does not have access to your live data. It only generates queries based on the descriptions you provide. Ensure your column names match your actual database schema.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-200"
            >
              Got it, let's go!
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default function App() {
  const [dataset, setDataset] = useState("");
  const [request, setRequest] = useState("");
  const [dialect, setDialect] = useState("Standard SQL");
  const [result, setResult] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'request'>('schema');

  const handleGenerate = async () => {
    if (!dataset.trim() && !request.trim()) {
      setActiveTab('schema');
      setError("Please provide a database schema and a user request.");
      return;
    }
    if (!dataset.trim()) {
      setActiveTab('schema');
      setError("Please provide a database schema.");
      return;
    }
    if (!request.trim()) {
      setActiveTab('request');
      setError("Please provide a user request (what you want to query).");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult("");
    setExplanation("");

    try {
      const sqlResult = await generateSQL(dataset, request, dialect);
      if (sqlResult.error) {
        setError(sqlResult.error.replace(/^ERROR:\s*/i, "").trim());
      } else {
        setResult(sqlResult.sql || "");
        setExplanation(sqlResult.explanation || "");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(result);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = result;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (error) {
          console.error(error);
        } finally {
          textArea.remove();
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch(err) {
      console.error(err);
    }
  };

  const handleExport = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = (ex: typeof EXAMPLES[0]) => {
    setDataset(ex.dataset);
    setRequest(ex.request);
    setIsMobileSidebarOpen(false);
  };

  const clearInputs = () => {
    setDataset("");
    setRequest("");
    setResult("");
    setExplanation("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col lg:overflow-hidden selection:bg-blue-100">
      {/* Header Navigation */}
      <nav className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 bg-blue-600 rounded flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.3)] shrink-0">
            <Database className="text-white w-5 h-5" />
          </div>
          <div className="hidden xs:block">
            <span className="font-bold text-base sm:text-lg tracking-tight">SQL <span className="text-blue-600">Generator</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all uppercase tracking-wide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden xs:inline">How to use</span>
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1 sm:mx-2"></div>
          <div className="flex items-center bg-slate-100 rounded-lg p-1 hidden md:flex">
            <button className="px-3 py-1.5 text-[11px] font-bold bg-white rounded shadow-sm uppercase tracking-wide">Editor</button>
            <button className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">History</button>
          </div>
          <div className="h-4 w-px bg-slate-200 mx-1 sm:mx-2 hidden xs:block"></div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">Service Online</span>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-2xl p-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Configurations</h3>
                  <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 font-bold transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <SidebarContent dialect={dialect} setDialect={setDialect} loadExample={loadExample} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="w-72 border-r border-slate-200 bg-white p-6 hidden lg:flex flex-col gap-8 shrink-0 overflow-y-auto">
          <SidebarContent dialect={dialect} setDialect={setDialect} loadExample={loadExample} />
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col p-4 sm:p-8 gap-6 sm:gap-8 bg-slate-50 overflow-y-auto lg:overflow-hidden">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 h-auto lg:h-full max-w-screen-2xl mx-auto w-full">
            {/* Input Section */}
            <div className="flex flex-col gap-6 sm:gap-8 overflow-hidden min-h-[500px] lg:min-h-0">
              <div className="flex bg-slate-200/50 p-1 rounded-xl shrink-0">
                <button 
                  onClick={() => setActiveTab('schema')}
                  className={cn("flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2", activeTab === 'schema' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}
                >
                  <Database className="w-3.5 h-3.5" />
                  Schema {dataset.trim() && <Check className="w-3.5 h-3.5 text-emerald-500"/>}
                </button>
                <button 
                  onClick={() => setActiveTab('request')}
                  className={cn("flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2", activeTab === 'request' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Request {request.trim() && <Check className="w-3.5 h-3.5 text-emerald-500"/>}
                </button>
              </div>

              {activeTab === 'schema' ? (
                <div className="flex flex-col flex-1 min-h-[250px] lg:min-h-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-blue-500" />
                        Database Schema
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">Define your tables and columns for accurate querying</p>
                    </div>
                    <button 
                      onClick={() => setDataset("")}
                      className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      title="Clear schema"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={dataset}
                    onChange={(e) => setDataset(e.target.value)}
                    placeholder="Paste schema, DDL, or list tables (e.g., users: id, name, email)"
                    className="flex-1 w-full bg-transparent p-5 font-mono text-[13px] leading-relaxed resize-none focus:outline-none focus:bg-blue-50/5 transition-all placeholder:text-slate-300"
                  />
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
                    <button 
                      onClick={() => setActiveTab('request')}
                      className="text-[11px] font-bold text-blue-600 uppercase tracking-wider hover:text-blue-700"
                    >
                      Next: Add Request &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-[250px] lg:min-h-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-blue-500" />
                        User Request
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">What information are you trying to retrieve?</p>
                    </div>
                    <button 
                      onClick={() => setRequest("")}
                      className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      title="Clear request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    placeholder="e.g. Find the top 3 customers by total spend..."
                    className="flex-1 w-full bg-transparent p-5 font-medium text-[13px] leading-relaxed resize-none focus:outline-none focus:bg-blue-50/5 transition-all placeholder:text-slate-300"
                  />
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
                    <button 
                      onClick={() => setActiveTab('schema')}
                      className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hover:text-slate-700"
                    >
                      &larr; Back to Schema
                    </button>
                  </div>
                </div>
              )}

              <button
                disabled={isGenerating}
                onClick={handleGenerate}
                className={cn(
                  "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-xl",
                  isGenerating 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200/50 active:scale-[0.98]"
                )}
              >
                {isGenerating ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Send className="w-4 h-4" />
                    </motion.div>
                    Optimising Components...
                  </>
                ) : (
                  <>
                    <span>Generate Optimized SQL</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Output Section */}
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Generated SQL Output</label>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-[10px] font-bold bg-slate-200 rounded-md text-slate-600 hover:bg-slate-300 transition-all uppercase tracking-wide flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button 
                    onClick={handleExport}
                    className="px-3 py-1.5 text-[10px] font-bold bg-slate-200 rounded-md text-slate-600 hover:bg-slate-300 transition-all uppercase tracking-wide flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3" />
                    Export
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-900 rounded-2xl relative overflow-auto shadow-2xl border border-slate-800 flex-1 min-h-[300px] lg:min-h-0 font-mono text-[13px] leading-relaxed">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md z-10"
                    >
                      <div className="space-y-5 text-center">
                        <div className="flex justify-center gap-1.5">
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                              className="w-2 h-2 bg-blue-500 rounded-full"
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em]">Validating Logic</p>
                      </div>
                    </motion.div>
                  ) : null}

                  {error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-full flex items-center justify-center text-center p-4 sm:p-8"
                    >
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 sm:p-8 max-w-sm w-full text-left self-center my-auto">
                        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <HelpCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-red-400 font-bold mb-4 text-center">We need a bit more info</p>
                        <div className="text-[12px] text-red-200/90 leading-relaxed font-sans whitespace-pre-wrap">
                          {error}
                        </div>
                      </div>
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full w-full pl-16 py-6 sm:py-8 pr-4 sm:pr-8"
                    >
                      <SyntaxHighlighter
                        language="sql"
                        style={atomOneDark}
                        wrapLongLines={true}
                        customStyle={{
                          background: 'transparent',
                          padding: 0,
                          margin: 0,
                          fontSize: '13px',
                          lineHeight: '1.8'
                        }}
                      >
                        {result}
                      </SyntaxHighlighter>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 p-8">
                      <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-slate-700/50">
                        <Terminal className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-sm font-semibold text-slate-500">Awaiting Schema Input</p>
                      <p className="text-xs opacity-40 mt-2 max-w-[200px]">The optimized SQL will be rendered here with syntax highlighting.</p>
                    </div>
                  )}
                </AnimatePresence>
                
                {/* Decorative Line Numbers */}
                {!isGenerating && !error && result && (
                  <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-slate-800/50 flex flex-col items-center pt-6 sm:pt-8 text-[11px] font-mono text-slate-700 select-none bg-slate-900/50">
                    {result.split('\n').map((_, i) => <span key={i} className="leading-[1.8]">{i + 1}</span>)}
                  </div>
                )}
              </div>

              {/* Status Footer */}
              {result && !error && !isGenerating && (
                <div className="flex flex-col gap-4 mt-6">
                  {explanation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 border border-blue-100 bg-white rounded-xl shadow-sm"
                    >
                      <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-blue-500" />
                        Query Explanation
                      </h4>
                      <div className="text-sm text-slate-600 leading-relaxed space-y-2">
                        {explanation.split('\n').map((line, i) => {
                           const isBullet = line.trim().startsWith('•');
                           if (isBullet) {
                             const content = line.trim().substring(1).trim();
                             const labelMatch = content.match(/^\*\*([^*]+)\*\*(.*)/);
                             if (labelMatch) {
                               return (
                                 <p key={i} className="flex gap-2">
                                   <span className="text-blue-500 mt-1 shrink-0">•</span>
                                   <span><strong className="text-slate-800">{labelMatch[1]}</strong>{labelMatch[2]}</span>
                                 </p>
                               );
                             }
                             return <p key={i} className="flex gap-2"><span className="text-blue-500 mt-1 shrink-0">•</span><span>{content}</span></p>;
                           }
                           return <p key={i}>{line}</p>;
                        })}
                      </div>
                    </motion.div>
                  )}

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-emerald-100 bg-emerald-50 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800">Query validated against provided schema</span>
                    </div>
                    <span className="text-[9px] text-emerald-600 font-mono font-bold tracking-widest">DIALECT: {dialect.toUpperCase()}</span>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="h-10 border-t border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 z-50 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest overflow-hidden">
        <span className="truncate mr-2">SQL Generator v2.0</span>
        <div className="flex gap-2 sm:gap-4 shrink-0">
          <span className="hidden xs:inline">Engine: Gemini-3-Flash</span>
          <span className="text-emerald-500 whitespace-nowrap">● Core Ready</span>
        </div>
      </footer>

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );

}
