import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bug, ChevronDown, ChevronRight, Copy, Check, ExternalLink, 
  AlertTriangle, ShieldAlert, Cpu, Terminal, Database, Layers, RefreshCw, X
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface DebugInfoPayload {
  rawInput: string;
  inputType: 'Normal keyword' | 'Product URL' | 'Short URL' | 'Mobile share link';
  parsedUrl?: {
    originalUrl?: string;
    resolvedUrl?: string;
    domain?: string;
    storeName?: string;
    productId?: string | null;
    productType?: string | null;
    slug?: string | null;
    extractedTitle?: string | null;
  } | null;
  querySpecs?: {
    rawQuery?: string;
    cleanQuery?: string;
    isCategorySearch?: boolean;
    category?: string | null;
    brand?: string | null;
    model?: string | null;
    storage?: string | null;
    ram?: string | null;
    color?: string | null;
    processor?: string | null;
  } | null;
  serpApiLog?: {
    requestUrl: string;
    params: any;
    headers: any;
    querySent: string;
    status: number | null;
    durationMs: number;
    totalReturned: number;
    fullResponse: any;
    errorReason: string | null;
  } | null;
  rapidApiLog?: {
    requestUrl: string;
    params: any;
    headers: any;
    querySent: string;
    status: number | null;
    durationMs: number;
    totalReturned: number;
    fullResponse: any;
    errorReason: string | null;
  } | null;
  parsedProducts?: Array<{
    title: string;
    price: string;
    source: string;
    thumbnail: string;
    link: string;
  }>;
  rejectedProducts?: Array<{
    title: string;
    price: string;
    source: string;
    discardReason: string;
  }>;
  finalDisplayedProducts?: Array<any>;
  errors?: string[];
  apiCapabilitiesNote?: string;
}

interface Props {
  debugInfo: DebugInfoPayload | null;
  query: string;
}

export default function DeveloperDebugPanel({ debugInfo, query }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'classification' | 'query' | 'serpapi' | 'rapidapi' | 'parsed' | 'rejected' | 'final' | 'guidance'>('classification');
  const [copied, setCopied] = useState(false);
  const [expandedJson, setExpandedJson] = useState<string | null>(null);

  if (!debugInfo) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Debug JSON copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 mb-12 w-full max-w-full">
      {/* Dev Panel Toggle Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-[#0d1117] border border-[#30363d] rounded-2xl hover:border-[#58a6ff] transition-all group shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
            <Terminal size={18} />
          </div>
          <div className="text-left">
            <div className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <span>BuyWise Developer Debug Panel</span>
              <span className="px-2 py-0.5 text-[9px] bg-purple-950 text-purple-300 border border-purple-800 rounded-full font-mono">
                PIPELINE INSPECTOR
              </span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
              Query: "{debugInfo.rawInput || query}" • Mode: <span className="text-emerald-400 font-bold">{debugInfo.inputType}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono">
            <span className="px-2 py-1 bg-[#161b22] border border-[#30363d] text-emerald-400 rounded-md">
              Final: {debugInfo.finalDisplayedProducts?.length || 0}
            </span>
            <span className="px-2 py-1 bg-[#161b22] border border-[#30363d] text-amber-400 rounded-md">
              Rejected: {debugInfo.rejectedProducts?.length || 0}
            </span>
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Debug Panel Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden font-mono shadow-2xl"
          >
            {/* Header Controls & Tabs */}
            <div className="p-4 bg-[#161b22] border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => setActiveTab('classification')}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] transition-all ${
                    activeTab === 'classification'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-bold'
                      : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
                  }`}
                >
                  📌 1. Classification & URL
                </button>
                <button
                  onClick={() => setActiveTab('query')}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] transition-all ${
                    activeTab === 'query'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-bold'
                      : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
                  }`}
                >
                  🔎 2. Query Specs
                </button>
                <button
                  onClick={() => setActiveTab('serpapi')}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] transition-all ${
                    activeTab === 'serpapi'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-bold'
                      : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
                  }`}
                >
                  🌐 3. SerpAPI Log
                </button>
                <button
                  onClick={() => setActiveTab('rapidapi')}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] transition-all ${
                    activeTab === 'rapidapi'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-bold'
                      : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
                  }`}
                >
                  ⚡ 4. RapidAPI Log
                </button>
                <button
                  onClick={() => setActiveTab('parsed')}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] transition-all ${
                    activeTab === 'parsed'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-bold'
                      : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
                  }`}
                >
                  📦 5. Parsed ({debugInfo.parsedProducts?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('rejected')}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] transition-all ${
                    activeTab === 'rejected'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-bold'
                      : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
                  }`}
                >
                  🚫 6. Rejected ({debugInfo.rejectedProducts?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('final')}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] transition-all ${
                    activeTab === 'final'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-bold'
                      : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
                  }`}
                >
                  🏆 7. Final ({debugInfo.finalDisplayedProducts?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('guidance')}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] transition-all ${
                    activeTab === 'guidance'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-bold'
                      : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
                  }`}
                >
                  💡 8. API Note
                </button>
              </div>

              <button
                onClick={() => copyToClipboard(JSON.stringify(debugInfo, null, 2))}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 text-xs rounded-lg hover:bg-emerald-900/60 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>Copy Debug JSON</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 text-xs text-gray-300 space-y-6 max-h-[550px] overflow-y-auto">
              {/* TAB 1: CLASSIFICATION */}
              {activeTab === 'classification' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl space-y-2">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">1. Raw User Input</span>
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] text-amber-300 rounded-lg break-all font-mono">
                        {debugInfo.rawInput || "(Empty)"}
                      </div>
                    </div>

                    <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl space-y-2">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">2. Classified Input Type</span>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-purple-950 border border-purple-700 text-purple-300 font-black rounded-lg text-sm">
                          {debugInfo.inputType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {debugInfo.parsedUrl && (
                    <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl space-y-3">
                      <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-2">
                        <span>3. Parsed E-Commerce URL Details</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                          <div className="text-[9px] text-gray-500 uppercase">Store Name</div>
                          <div className="text-white font-bold text-sm mt-0.5">{debugInfo.parsedUrl.storeName || "Unknown"}</div>
                        </div>
                        <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                          <div className="text-[9px] text-gray-500 uppercase">Product Identifier (ASIN / PID)</div>
                          <div className="text-cyan-400 font-mono font-bold mt-0.5">
                            {debugInfo.parsedUrl.productId ? `${debugInfo.parsedUrl.productId} (${debugInfo.parsedUrl.productType || "ID"})` : "None Extracted"}
                          </div>
                        </div>
                        <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                          <div className="text-[9px] text-gray-500 uppercase">Domain</div>
                          <div className="text-gray-300 font-mono mt-0.5">{debugInfo.parsedUrl.domain || "N/A"}</div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <div className="text-[10px] text-gray-400">Expanded Destination URL:</div>
                        <div className="p-2 bg-[#0d1117] border border-[#30363d] text-cyan-300 text-[11px] rounded-lg break-all">
                          {debugInfo.parsedUrl.resolvedUrl || debugInfo.parsedUrl.originalUrl || "N/A"}
                        </div>
                      </div>

                      {debugInfo.parsedUrl.extractedTitle && (
                        <div className="space-y-1 pt-1">
                          <div className="text-[10px] text-emerald-400 font-bold">Extracted Title From URL / Metadata:</div>
                          <div className="p-2 bg-emerald-950/30 border border-emerald-800 text-emerald-200 text-xs rounded-lg">
                            "{debugInfo.parsedUrl.extractedTitle}"
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: QUERY SPECS */}
              {activeTab === 'query' && debugInfo.querySpecs && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl space-y-4">
                    <div className="text-xs text-purple-400 font-bold uppercase tracking-wider">Product Intelligence Specs</div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">Brand</div>
                        <div className="text-amber-300 font-bold mt-0.5">{debugInfo.querySpecs.brand || "Not Specified"}</div>
                      </div>
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">Model</div>
                        <div className="text-white font-bold mt-0.5">{debugInfo.querySpecs.model || "Not Specified"}</div>
                      </div>
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">Category</div>
                        <div className="text-cyan-300 font-bold mt-0.5">{debugInfo.querySpecs.category || "General"}</div>
                      </div>
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">Category Broad Search?</div>
                        <div className="text-emerald-400 font-bold mt-0.5">{debugInfo.querySpecs.isCategorySearch ? "YES" : "NO"}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">Storage</div>
                        <div className="text-gray-300 mt-0.5">{debugInfo.querySpecs.storage || "N/A"}</div>
                      </div>
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">RAM</div>
                        <div className="text-gray-300 mt-0.5">{debugInfo.querySpecs.ram || "N/A"}</div>
                      </div>
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">Color</div>
                        <div className="text-gray-300 mt-0.5">{debugInfo.querySpecs.color || "N/A"}</div>
                      </div>
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">Processor</div>
                        <div className="text-gray-300 mt-0.5">{debugInfo.querySpecs.processor || "N/A"}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg space-y-1">
                      <div className="text-[10px] text-gray-400">Normalized Search Query Sent to Engine:</div>
                      <div className="text-white font-mono font-bold">{debugInfo.querySpecs.cleanQuery}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SERPAPI LOG */}
              {activeTab === 'serpapi' && debugInfo.serpApiLog && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-cyan-400 uppercase">Google Shopping via SerpAPI Call</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        debugInfo.serpApiLog.status === 200 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        HTTP STATUS: {debugInfo.serpApiLog.status || "FAILED / BYPASSED"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">Target Endpoint</div>
                        <div className="text-gray-300 truncate mt-0.5">{debugInfo.serpApiLog.requestUrl}</div>
                      </div>
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">Query Sent</div>
                        <div className="text-amber-300 font-bold mt-0.5">"{debugInfo.serpApiLog.querySent}"</div>
                      </div>
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">Items Returned</div>
                        <div className="text-emerald-400 font-bold mt-0.5">{debugInfo.serpApiLog.totalReturned} products</div>
                      </div>
                    </div>

                    {debugInfo.serpApiLog.errorReason && (
                      <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-red-300 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                          <AlertTriangle size={14} /> Pipeline Diagnosis / Exception
                        </div>
                        <div className="text-xs font-mono">{debugInfo.serpApiLog.errorReason}</div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={() => setExpandedJson(expandedJson === 'serp' ? null : 'serp')}
                        className="px-3 py-1.5 bg-[#0d1117] border border-[#30363d] hover:border-gray-500 text-gray-300 rounded-lg text-xs font-mono flex items-center gap-2"
                      >
                        <span>{expandedJson === 'serp' ? 'Hide' : 'Inspect'} Full SerpAPI Response Payload</span>
                      </button>

                      {expandedJson === 'serp' && (
                        <pre className="mt-3 p-4 bg-[#0d1117] border border-[#30363d] rounded-xl text-[10px] text-emerald-300 max-h-72 overflow-auto font-mono">
                          {JSON.stringify(debugInfo.serpApiLog.fullResponse, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: RAPIDAPI LOG */}
              {activeTab === 'rapidapi' && debugInfo.rapidApiLog && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-amber-400 uppercase">RapidAPI Real-Time E-Commerce Integration</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        debugInfo.rapidApiLog.status === 200 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-gray-900 text-gray-400 border border-gray-700'
                      }`}>
                        HTTP STATUS: {debugInfo.rapidApiLog.status || "SKIPPED / UNCONFIGURED"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">Endpoint</div>
                        <div className="text-gray-300 truncate mt-0.5">{debugInfo.rapidApiLog.requestUrl}</div>
                      </div>
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">Query / Host</div>
                        <div className="text-amber-300 font-bold mt-0.5">"{debugInfo.rapidApiLog.querySent}"</div>
                      </div>
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                        <div className="text-[9px] text-gray-500 uppercase">Items Returned</div>
                        <div className="text-emerald-400 font-bold mt-0.5">{debugInfo.rapidApiLog.totalReturned} products</div>
                      </div>
                    </div>

                    {debugInfo.rapidApiLog.errorReason && (
                      <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-lg text-amber-300 text-xs">
                        {debugInfo.rapidApiLog.errorReason}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: PARSED PRODUCTS */}
              {activeTab === 'parsed' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-emerald-400">Candidate Products Extracted ({debugInfo.parsedProducts?.length || 0})</div>
                  {debugInfo.parsedProducts && debugInfo.parsedProducts.length > 0 ? (
                    <div className="space-y-2">
                      {debugInfo.parsedProducts.map((p, idx) => (
                        <div key={idx} className="p-3 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img src={p.thumbnail} alt="" className="w-10 h-10 object-contain rounded bg-white p-0.5" />
                            <div>
                              <div className="text-white font-bold text-xs">{p.title}</div>
                              <div className="text-[10px] text-gray-400">Store: <span className="text-cyan-300 font-bold">{p.source}</span></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-400 font-bold">{p.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-[#161b22] text-gray-400 rounded-xl">No candidates extracted from raw API response.</div>
                  )}
                </div>
              )}

              {/* TAB 6: REJECTED PRODUCTS */}
              {activeTab === 'rejected' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-amber-400">Products Filtered Out / Discarded ({debugInfo.rejectedProducts?.length || 0})</div>
                  {debugInfo.rejectedProducts && debugInfo.rejectedProducts.length > 0 ? (
                    <div className="space-y-2">
                      {debugInfo.rejectedProducts.map((p, idx) => (
                        <div key={idx} className="p-3 bg-[#161b22] border border-[#30363d] rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="text-gray-300 font-bold text-xs">{p.title}</div>
                            <span className="text-amber-400 text-xs font-bold">{p.price}</span>
                          </div>
                          <div className="p-2 bg-red-950/40 border border-red-900/60 text-red-300 text-[10px] rounded-lg">
                            ❌ Discard Reason: {p.discardReason}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-[#161b22] text-emerald-400 rounded-xl">No products were rejected by relevance engine.</div>
                  )}
                </div>
              )}

              {/* TAB 7: FINAL DISPLAYED PRODUCTS */}
              {activeTab === 'final' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-purple-400">Final Displayed Product Options ({debugInfo.finalDisplayedProducts?.length || 0})</div>
                  {debugInfo.finalDisplayedProducts && debugInfo.finalDisplayedProducts.length > 0 ? (
                    <div className="space-y-2">
                      {debugInfo.finalDisplayedProducts.map((p, idx) => (
                        <div key={idx} className="p-3 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img src={p.thumbnail} alt="" className="w-10 h-10 object-contain rounded bg-white p-0.5" />
                            <div>
                              <div className="text-white font-bold text-xs">{p.title}</div>
                              <div className="text-[10px] text-gray-400">
                                Store: <span className="text-cyan-300 font-bold">{p.source}</span>
                                {p.isBest && <span className="ml-2 text-emerald-400 font-black">🏆 BEST DEAL</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-400 font-bold">{p.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-[#161b22] text-red-400 rounded-xl">No products available in final response payload.</div>
                  )}
                </div>
              )}

              {/* TAB 8: API GUIDANCE */}
              {activeTab === 'guidance' && (
                <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl space-y-3 text-xs leading-relaxed">
                  <div className="text-amber-400 font-bold uppercase tracking-wider">💡 Developer Architecture Guidance: Shopping URL Lookup</div>
                  <p className="text-gray-300">
                    Neither Google Shopping (SerpAPI) nor RapidAPI support searching directly using raw URL strings. Standard shopping API endpoints expect keywords, product titles, ASINs, or PIDs.
                  </p>
                  <p className="text-gray-300">
                    <strong>BuyWise Resolution Strategy:</strong> When a user pastes a product link or mobile share message:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-300">
                    <li>1. Expand short links (e.g. <code>fkrt.it</code>, <code>dl.flipkart.com</code>, <code>amzn.in</code>) by following HTTP redirects.</li>
                    <li>2. Extract ASIN (Amazon 10-char code) or Flipkart PID (e.g., <code>pid=...</code> or <code>/p/itm...</code>).</li>
                    <li>3. Extract the product model name from URL slugs or web page metadata.</li>
                    <li>4. Search live stores with the clean model name (e.g., <code>"Apple iPhone 15 128GB"</code>) to retrieve prices across all major Indian e-commerce stores simultaneously.</li>
                  </ul>
                  {debugInfo.apiCapabilitiesNote && (
                    <div className="p-3 bg-purple-950/40 border border-purple-800 rounded-lg text-purple-200 mt-2 font-mono text-[11px]">
                      {debugInfo.apiCapabilitiesNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
