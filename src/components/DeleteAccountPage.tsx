import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, ShieldAlert, CheckCircle2, ArrowLeft, AlertTriangle, 
  Clock, Database, Mail, UserX, FileText, Check, Loader2, ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SEO from './SEO';
import toast from 'react-hot-toast';

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const { user, deleteAccountAndData, openLogin } = useAuth();

  // Logged-in instant deletion state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasDeleted, setHasDeleted] = useState(false);

  // Web request form state (for logged-out or external users)
  const [reqEmail, setReqEmail] = useState('');
  const [reqReason, setReqReason] = useState('No longer using the app');
  const [reqCustomReason, setReqCustomReason] = useState('');
  const [reqAgreed, setReqAgreed] = useState(false);
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState<any | null>(null);

  const handleExecuteInAppDeletion = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccountAndData();
      setShowConfirmModal(false);
      setHasDeleted(true);
      toast.success('Your BuyWise account has been permanently deleted.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account. Please try again or submit a web request below.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitWebRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqEmail || !reqEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!reqAgreed) {
      toast.error('Please confirm that you understand this action cannot be undone.');
      return;
    }

    setIsSubmittingReq(true);
    try {
      const fullReason = reqReason === 'Other' 
        ? `Other: ${reqCustomReason.trim() || 'Not specified'}` 
        : reqReason;

      const res = await fetch('/api/account/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: reqEmail.trim(),
          reason: fullReason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request.');
      }

      setRequestSubmitted({
        email: reqEmail.trim(),
        requestId: data.requestId || 'REQ-' + Date.now(),
        date: new Date().toLocaleDateString()
      });
      toast.success('Account deletion request registered successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Error submitting request. Please try again.');
    } finally {
      setIsSubmittingReq(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#f5f5f5] selection:bg-[#FF3B30] selection:text-white pb-20">
      <SEO 
        title="Delete BuyWise Account & Data | BuyWise" 
        description="Public account and personal data deletion instructions and request submission page for BuyWise users in compliance with Google Play Policy." 
        canonicalUrl="https://buywiser.store/delete-account" 
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors mb-8 cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to BuyWise
        </button>

        {/* Page Title & Badge */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-wide uppercase mb-4">
            <UserX size={13} />
            Data Safety & Right to be Forgotten
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
            Account & Personal Data Deletion
          </h1>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-3xl">
            BuyWise provides account deletion and data-rights controls designed to support applicable privacy requirements and platform policies, including Google Play account deletion standards. You can permanently erase your account credentials, gamification profile, and associated personal records anytime.
          </p>
        </div>

        {/* Post-Deletion Success State */}
        {hasDeleted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 sm:p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-4"
          >
            <CheckCircle2 size={28} className="shrink-0 mt-1 text-emerald-400" />
            <div>
              <h3 className="text-lg font-bold text-emerald-200 mb-1">Account Deleted Successfully</h3>
              <p className="text-sm text-emerald-300/80 leading-relaxed mb-4">
                Your BuyWise account, profile, coins, wishlist, and associated personal data have been permanently erased from our servers. Your local session has been cleared.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Return to Homepage
              </button>
            </div>
          </motion.div>
        )}

        {/* Action Panel: In-App Deletion vs Public Form */}
        {!hasDeleted && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Box 1: Logged-in Instant Deletion */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-5">
                  <Trash2 size={22} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Option 1: Instant In-App Deletion</h2>
                <p className="text-sm text-white/60 mb-6 leading-relaxed">
                  If you have active access to your account, you can erase your data immediately in real time.
                </p>

                {user ? (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 mb-6 space-y-1">
                    <p className="text-xs text-white/40 uppercase font-semibold">Currently signed in as</p>
                    <p className="text-sm font-bold text-white">{user.displayName || 'BuyWise User'}</p>
                    <p className="text-xs font-mono text-white/70">{user.email || 'No email associated'}</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 mb-6">
                    <p className="text-xs text-white/50 leading-relaxed">
                      You are not currently logged in. Sign in to delete your account immediately, or use Option 2 below.
                    </p>
                  </div>
                )}
              </div>

              <div>
                {user ? (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete Account Now
                  </button>
                ) : (
                  <button
                    onClick={openLogin}
                    className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    Log In to Delete Instantly
                  </button>
                )}
              </div>
            </div>

            {/* Box 2: Public Web Deletion Request Form */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-5">
                  <Mail size={22} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Option 2: Web Deletion Request</h2>
                <p className="text-sm text-white/60 mb-6 leading-relaxed">
                  Lost access to your device or unable to log in? Submit an official deletion request directly through this web form.
                </p>

                {requestSubmitted ? (
                  <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    <div className="flex items-center gap-2 font-bold mb-2">
                      <Check size={18} className="text-emerald-400" />
                      Request Registered
                    </div>
                    <p className="text-xs text-emerald-300/80 mb-2">
                      Request ID: <span className="font-mono font-bold text-white">{requestSubmitted.requestId}</span>
                    </p>
                    <p className="text-xs text-emerald-300/80 leading-relaxed">
                      Our system and privacy team will process and verify deletion for <strong>{requestSubmitted.email}</strong> within 24 to 48 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitWebRequest} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Registered Account Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={reqEmail}
                        onChange={(e) => setReqEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Reason for Deletion (Optional)
                      </label>
                      <select
                        value={reqReason}
                        onChange={(e) => setReqReason(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
                      >
                        <option value="No longer using the app">No longer using the app</option>
                        <option value="Privacy concerns">Privacy concerns</option>
                        <option value="Created a duplicate account">Created a duplicate account</option>
                        <option value="Switching email address">Switching email address</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {reqReason === 'Other' && (
                      <div>
                        <input
                          type="text"
                          value={reqCustomReason}
                          onChange={(e) => setReqCustomReason(e.target.value)}
                          placeholder="Please tell us why (optional)"
                          className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-500/60"
                        />
                      </div>
                    )}

                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="agree-delete"
                        checked={reqAgreed}
                        onChange={(e) => setReqAgreed(e.target.checked)}
                        className="mt-0.5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500 cursor-pointer"
                      />
                      <label htmlFor="agree-delete" className="text-xs text-white/60 leading-relaxed cursor-pointer select-none">
                        I confirm that I own this account and request complete deletion of my profile and data. I understand this action cannot be undone.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReq || !reqAgreed}
                      className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmittingReq ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Deletion Request'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Data Disclosure (Google Play Compliance Specification) */}
        <div className="space-y-8 mb-12">
          <div className="border-t border-white/10 pt-10">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2.5">
              <Database size={22} className="text-[#FF3B30]" />
              Data Inventory: What is Deleted vs Retained
            </h2>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              When an account deletion is executed, BuyWise securely purges all user data across all storage layers. Here is an exact breakdown of how your records are handled:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deleted Data */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wider mb-4">
                  <Trash2 size={16} />
                  Permanently Deleted Data
                </div>
                <ul className="space-y-3 text-sm text-white/70">
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold mt-0.5">•</span>
                    <span><strong>Authentication Credentials:</strong> User IDs, hashed passwords, session tokens, and OAuth linkage.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold mt-0.5">•</span>
                    <span><strong>Profile Data:</strong> Full name, email address, custom avatars, and account preferences.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold mt-0.5">•</span>
                    <span><strong>BuyWise Coins & Gamification:</strong> Coin balances, login streaks, earned badges, spin records, and reward claims.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold mt-0.5">•</span>
                    <span><strong>Saved Items & Radar:</strong> Price alert subscriptions, tracked products, and comparison lists.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold mt-0.5">•</span>
                    <span><strong>Scans & Reviews:</strong> Barcode scan history and user-authored merchant/product reviews.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold mt-0.5">•</span>
                    <span><strong>Support Messages:</strong> Chat transcripts, tickets, and attachments in our support desk.</span>
                  </li>
                </ul>
              </div>

              {/* Retained Data (Statutory & Regulatory Obligations Only) */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider mb-4">
                  <FileText size={16} />
                  Statutory & Regulatory Retention
                </div>
                <ul className="space-y-3 text-sm text-white/70">
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span><strong>Applicable Legal Records:</strong> Certain financial, tax, accounting, payment, or transaction records may be retained where required by applicable law or regulatory obligations. These records are restricted to the minimum necessary legal purpose and are not used for marketing.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span><strong>Scope of Deletion:</strong> Account deletion removes personal and account data that BuyWise is permitted to delete, while legally required records may be retained for the applicable statutory period.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span><strong>Purpose Limitation & Isolation:</strong> Any retained records are isolated, securely stored, and never utilized for marketing, behavioral profiling, or advertising.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Timeline & SLA */}
          <div className="p-6 rounded-2xl bg-[#111111] border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-cyan-400" />
              Processing Timelines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">In-App Deletion</p>
                <p className="text-white font-bold text-base mb-1">Immediate (Real-Time)</p>
                <p className="text-white/50 text-xs">Executed instantly upon your confirmation in Account Settings.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs uppercase font-bold text-orange-400 tracking-wider mb-1">Web Form Submission</p>
                <p className="text-white font-bold text-base mb-1">Within 24 to 48 Hours</p>
                <p className="text-white/50 text-xs">Verified and processed by our data privacy desk with email confirmation.</p>
              </div>
            </div>
          </div>

          {/* Support and Grievance Officer */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-white/50">
            <div>
              <p className="font-bold text-white text-sm mb-1">Need help or have privacy questions?</p>
              <p>Contact our Data Protection & Grievance Officer directly:</p>
              <a href="mailto:mohammdsaeed24@gmail.com?subject=Account%20Deletion%20Assistance" className="text-[#FF3B30] hover:underline font-mono text-sm mt-1 inline-block">
                mohammdsaeed24@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="/support" className="hover:text-white transition-colors">Human Support Desk</a>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Logged-In User */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#161616] border border-red-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl text-left"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
                <AlertTriangle size={24} />
              </div>

              <h3 className="text-xl font-black text-white mb-2">Delete your BuyWise account?</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4">
                This will permanently delete your account, personal profile, BuyWise coins, saved alerts, reviews, and all associated data. <span className="text-red-400 font-semibold">This action cannot be undone.</span>
              </p>

              <div className="mb-5 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                <label className="block text-xs font-bold uppercase tracking-wider text-red-300 mb-1.5">
                  Type <span className="text-white bg-red-500/30 px-1 py-0.5 rounded font-mono">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 text-white font-mono text-sm tracking-widest uppercase focus:outline-none focus:border-red-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteInAppDeletion}
                  disabled={isDeleting || confirmText.trim().toUpperCase() !== 'DELETE'}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
