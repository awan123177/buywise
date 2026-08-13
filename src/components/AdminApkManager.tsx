import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, Upload, Check, Copy, AlertCircle, RefreshCw, 
  Trash2, ShieldCheck, CheckCircle2, History, Smartphone, FileCode, Layers, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ApkRelease {
  id: string;
  filename: string;
  originalFilename: string;
  versionName: string;
  versionCode: string;
  packageName: string;
  fileSize: number;
  fileSizeFormatted: string;
  storagePath: string;
  publicUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'ACTIVE' | 'ARCHIVED';
  downloadCount: number;
  isManualMeta?: boolean;
}

interface ApkStats {
  totalDownloads: number;
  currentVersionDownloads: number;
  last24Hours: number;
  last7Days: number;
  last30Days: number;
  allTime: number;
}

interface AdminApkManagerProps {
  email: string;
  passcode: string;
}

export default function AdminApkManager({ email, passcode }: AdminApkManagerProps) {
  const [releases, setReleases] = useState<ApkRelease[]>([]);
  const [stats, setStats] = useState<ApkStats | null>(null);
  const [activeApk, setActiveApk] = useState<ApkRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Upload modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<'pick' | 'info' | 'confirm' | 'success'>('pick');
  const [isValidating, setIsValidating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Validation output
  const [validatedInfo, setValidatedInfo] = useState<{
    filename: string;
    packageName: string;
    versionName: string;
    versionCode: string;
    fileSize: number;
    fileSizeFormatted: string;
    isManualMeta?: boolean;
  } | null>(null);

  // Editable meta state for manual entry
  const [manualVersionName, setManualVersionName] = useState('');
  const [manualVersionCode, setManualVersionCode] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const authHeaders = {
    'x-user-email': email,
    'x-admin-passcode': passcode,
  };

  const safeParseJson = async (res: Response) => {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    if (text.trim().startsWith('<')) {
      throw new Error(`Server returned HTML (${res.status} ${res.statusText})`);
    }
    throw new Error(text || `HTTP ${res.status}`);
  };

  const fetchApkData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/apk/releases', { headers: authHeaders });
      if (res.ok) {
        const data = await safeParseJson(res);
        setReleases(data.releases || []);
        setStats(data.stats || null);
        setActiveApk(data.activeApk || null);
      } else {
        toast.error('Failed to load APK release records');
      }
    } catch (e: any) {
      console.error(e);
      toast.error('Network error loading APK releases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApkData();
  }, []);

  const handleCopyUrl = (url: string = 'https://buywiser.store/downloads/buywise.apk') => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Direct APK URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.apk')) {
      toast.error('Please select a valid APK file. Only .apk files are allowed.');
      setValidationError('Please select a valid APK file.');
      return;
    }

    setSelectedFile(file);
    setValidationError(null);
    setIsValidating(true);

    const formData = new FormData();
    formData.append('apkFile', file);

    try {
      const res = await fetch('/api/admin/apk/validate', {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });

      const data = await safeParseJson(res);

      if (!res.ok || !data.success) {
        setValidationError(data.error || 'Failed to validate APK file.');
        toast.error(data.error || 'Please select a valid APK file.');
        setSelectedFile(null);
      } else {
        setValidatedInfo(data);
        setManualVersionName(data.versionName || '1.0.0');
        setManualVersionCode(data.versionCode || '100');
        setUploadStep('info');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to validate APK file.');
      setValidationError(err.message || 'Failed to validate APK file.');
      setSelectedFile(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handlePublishApk = async () => {
    if (!selectedFile) return;

    setIsPublishing(true);
    const formData = new FormData();
    formData.append('apkFile', selectedFile);
    formData.append('versionName', manualVersionName);
    formData.append('versionCode', manualVersionCode);

    try {
      const res = await fetch('/api/admin/apk/publish', {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });

      const data = await safeParseJson(res);

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to publish APK.');
      } else {
        toast.success('APK published successfully!');
        setUploadStep('success');
        fetchApkData();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to upload and publish APK.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleActivateRelease = async (id: string, versionName: string) => {
    if (!confirm(`Are you sure you want to rollback/activate Version ${versionName}?`)) return;

    try {
      const res = await fetch(`/api/admin/apk/${id}/activate`, {
        method: 'POST',
        headers: authHeaders,
      });

      const data = await safeParseJson(res);
      if (res.ok && data.success) {
        toast.success(`Version ${versionName} is now ACTIVE!`);
        fetchApkData();
      } else {
        toast.error(data.error || 'Failed to activate release.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error activating release.');
    }
  };

  const handleDeleteRelease = async (id: string, versionName: string) => {
    if (!confirm(`Are you sure you want to delete archived release Version ${versionName}?`)) return;

    try {
      const res = await fetch(`/api/admin/apk/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      const data = await safeParseJson(res);
      if (res.ok && data.success) {
        toast.success(`Archived release Version ${versionName} deleted.`);
        fetchApkData();
      } else {
        toast.error(data.error || 'Failed to delete release.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error deleting release.');
    }
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setValidatedInfo(null);
    setUploadStep('pick');
    setValidationError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-[#FF3B30] font-black uppercase tracking-widest animate-pulse">
        LOADING ANDROID APK MANAGER...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-[#FF3B30] font-black uppercase text-xs tracking-widest">
            <Smartphone size={16} /> Android Release Operations
          </div>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight mt-1">
            Android APK Manager
          </h2>
          <p className="text-xs text-white/50">
            Publish and manage BuyWise Android package builds. Public URL stays permanent at <code className="text-white/80 font-mono">https://buywiser.store/downloads/buywise.apk</code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              resetModal();
              setIsModalOpen(true);
            }}
            className="px-5 py-3 bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-[#FF3B30]/20 transition-all cursor-pointer"
          >
            <Upload size={16} />
            Upload New APK
          </button>

          <a
            href="/downloads/buywise.apk"
            download="buywise.apk"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-white/10"
          >
            <Download size={16} />
            Download Current APK
          </a>

          <button
            onClick={fetchApkData}
            className="p-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all cursor-pointer border border-white/10"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Current Active APK Overview Card */}
      {activeApk && (
        <div className="bg-gradient-to-br from-[#FF3B30]/15 via-black/80 to-black/90 border border-[#FF3B30]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#FF3B30] text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg shadow-[#FF3B30]/30">
                  <CheckCircle2 size={12} /> STATUS: {activeApk.status}
                </span>
                <span className="text-xs text-white/40 uppercase font-mono">Package: {activeApk.packageName}</span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  CURRENT APK: <span className="text-[#FF3B30]">{activeApk.filename}</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Uploaded on {new Date(activeApk.uploadedAt).toLocaleString()} by <span className="text-white font-bold">{activeApk.uploadedBy}</span>
                </p>
              </div>
            </div>

            {/* Direct URL & Copy Button */}
            <div className="w-full lg:w-auto bg-black/60 border border-white/10 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-white/40 block">Permanent Public Direct URL</span>
              <div className="flex items-center gap-3">
                <code className="text-xs font-mono text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  https://buywiser.store/downloads/buywise.apk
                </code>
                <button
                  onClick={() => handleCopyUrl()}
                  className="px-3 py-1.5 bg-[#FF3B30]/20 hover:bg-[#FF3B30]/40 text-[#FF3B30] font-black text-xs uppercase tracking-wider rounded-lg border border-[#FF3B30]/30 flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Active APK Metadata Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black/40 border border-white/10 p-4 rounded-2xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/40 block">Version Name</span>
              <span className="text-lg font-black text-white">{activeApk.versionName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-white/40 block">Version Code</span>
              <span className="text-lg font-black text-white">{activeApk.versionCode}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-white/40 block">File Size</span>
              <span className="text-lg font-black text-white">{activeApk.fileSizeFormatted}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-white/40 block">Total Downloads</span>
              <span className="text-lg font-black text-[#FF3B30]">{activeApk.downloadCount || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Counter Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Downloads', value: stats.totalDownloads, color: 'text-[#FF3B30]' },
            { label: 'Current Ver Downloads', value: stats.currentVersionDownloads, color: 'text-white' },
            { label: 'Last 24 Hours', value: stats.last24Hours, color: 'text-emerald-400' },
            { label: 'Last 7 Days', value: stats.last7Days, color: 'text-sky-400' },
            { label: 'Last 30 Days', value: stats.last30Days, color: 'text-purple-400' },
            { label: 'All Time Logs', value: stats.allTime, color: 'text-amber-400' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/40 block">{item.label}</span>
              <span className={`text-2xl font-black ${item.color}`}>{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* APK Release History Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden space-y-4">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[#FF3B30]" />
            <h3 className="text-lg font-black uppercase text-white tracking-tight">
              APK Release History
            </h3>
          </div>
          <span className="text-xs text-white/40 font-mono">
            Total Releases: {releases.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/60 text-white/40 uppercase text-[10px] font-black tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Version</th>
                <th className="p-4">Code</th>
                <th className="p-4">Filename</th>
                <th className="p-4">Size</th>
                <th className="p-4">Uploaded By</th>
                <th className="p-4">Upload Date</th>
                <th className="p-4">Downloads</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {releases.map((rel) => (
                <tr key={rel.id} className="hover:bg-white/5 transition-all">
                  <td className="p-4 font-black text-white text-sm">
                    {rel.versionName}
                  </td>
                  <td className="p-4 font-mono text-white/70">{rel.versionCode}</td>
                  <td className="p-4 font-mono text-white/80 max-w-[180px] truncate" title={rel.filename}>
                    {rel.filename}
                  </td>
                  <td className="p-4 text-white/70">{rel.fileSizeFormatted}</td>
                  <td className="p-4 text-white/70">{rel.uploadedBy}</td>
                  <td className="p-4 text-white/60">
                    {new Date(rel.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-bold text-white">{rel.downloadCount || 0}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        rel.status === 'ACTIVE'
                          ? 'bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/40'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {rel.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <a
                      href="/downloads/buywise.apk"
                      download="buywise.apk"
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-[10px] uppercase transition-all inline-flex items-center gap-1"
                      title="Download"
                    >
                      <Download size={12} /> Download
                    </a>

                    {rel.status === 'ARCHIVED' && (
                      <button
                        onClick={() => handleActivateRelease(rel.id, rel.versionName)}
                        className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold rounded-lg text-[10px] uppercase transition-all cursor-pointer inline-flex items-center gap-1"
                        title="Rollback / Make Active"
                      >
                        <ShieldCheck size={12} /> Make Active
                      </button>
                    )}

                    {rel.status === 'ARCHIVED' && (
                      <button
                        onClick={() => handleDeleteRelease(rel.id, rel.versionName)}
                        className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-lg text-[10px] uppercase transition-all cursor-pointer inline-flex items-center gap-1"
                        title="Delete Archived Release"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal Drawer */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 relative shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-black uppercase text-white tracking-tight">
                    Upload New APK
                  </h3>
                  <p className="text-xs text-white/50">
                    Select an Android .apk package to replace the current active build.
                  </p>
                </div>
                <button
                  onClick={resetModal}
                  className="text-white/40 hover:text-white font-bold p-2"
                >
                  ✕
                </button>
              </div>

              {/* Step 1: File Picker */}
              {uploadStep === 'pick' && (
                <div className="space-y-6 text-center py-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".apk"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 hover:border-[#FF3B30] rounded-2xl p-10 cursor-pointer transition-all bg-white/5 hover:bg-white/10 space-y-3"
                  >
                    <div className="w-16 h-16 bg-[#FF3B30]/20 text-[#FF3B30] rounded-full flex items-center justify-center mx-auto">
                      <Upload size={32} />
                    </div>
                    <p className="text-base font-bold text-white uppercase">
                      Click to select .apk file
                    </p>
                    <p className="text-xs text-white/40">
                      Only .apk files allowed (Max size: 200 MB)
                    </p>
                  </div>

                  {isValidating && (
                    <p className="text-xs text-[#FF3B30] font-bold uppercase animate-pulse">
                      Validating APK package and reading metadata...
                    </p>
                  )}

                  {validationError && (
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-400 font-bold flex items-center gap-2">
                      <AlertCircle size={16} />
                      {validationError}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Inspection & Info */}
              {uploadStep === 'info' && validatedInfo && (
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#FF3B30] tracking-wider">
                      APK Information
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-white/40 block">Filename</span>
                        <span className="font-mono text-white font-bold truncate block">{validatedInfo.filename}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">File Size</span>
                        <span className="text-white font-bold">{validatedInfo.fileSizeFormatted}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">Package Name</span>
                        <span className="font-mono text-emerald-400 font-bold">{validatedInfo.packageName}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">Version Code</span>
                        <span className="text-white font-bold">{validatedInfo.versionCode || manualVersionCode}</span>
                      </div>
                    </div>
                  </div>

                  {validatedInfo.isManualMeta && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-300 space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <AlertCircle size={14} /> Information was manually entered
                      </p>
                      <p className="text-[11px] text-amber-200/70">
                        APK manifest metadata could not be fully read automatically. Please verify Version Name and Version Code below.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/50 block mb-1">
                        Version Name
                      </label>
                      <input
                        type="text"
                        value={manualVersionName}
                        onChange={(e) => setManualVersionName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-[#FF3B30]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/50 block mb-1">
                        Version Code
                      </label>
                      <input
                        type="text"
                        value={manualVersionCode}
                        onChange={(e) => setManualVersionCode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-[#FF3B30]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      onClick={resetModal}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setUploadStep('confirm')}
                      className="px-6 py-2.5 bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white text-xs font-black uppercase rounded-xl shadow-lg shadow-[#FF3B30]/20"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {uploadStep === 'confirm' && (
                <div className="space-y-6 text-center py-2">
                  <div className="w-16 h-16 bg-[#FF3B30]/20 text-[#FF3B30] rounded-full flex items-center justify-center mx-auto border border-[#FF3B30]/40">
                    <AlertCircle size={32} />
                  </div>

                  <div>
                    <h4 className="text-2xl font-black uppercase text-white">Publish this APK?</h4>
                    <p className="text-xs text-white/60 mt-2 max-w-sm mx-auto">
                      Publishing this APK will replace the current active build ({activeApk?.versionName}). The permanent public download URL will serve Version {manualVersionName} immediately.
                    </p>
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    <button
                      onClick={() => setUploadStep('info')}
                      disabled={isPublishing}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePublishApk}
                      disabled={isPublishing}
                      className="px-8 py-3 bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white text-xs font-black uppercase rounded-xl shadow-xl shadow-[#FF3B30]/30 flex items-center gap-2"
                    >
                      {isPublishing ? 'Publishing...' : 'Publish APK'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {uploadStep === 'success' && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 size={36} />
                  </div>

                  <div>
                    <h4 className="text-2xl font-black uppercase text-white">APK Published Successfully!</h4>
                    <p className="text-xs text-white/60 mt-1">
                      Current Version {manualVersionName} is now ACTIVE.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 text-left">
                    <span className="text-[10px] font-bold text-white/40 uppercase block">Direct Public Download URL</span>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-mono text-emerald-400">https://buywiser.store/downloads/buywise.apk</code>
                      <button
                        onClick={() => handleCopyUrl()}
                        className="px-3 py-1 bg-[#FF3B30] text-white text-[10px] font-bold uppercase rounded-lg"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={resetModal}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase rounded-xl"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
