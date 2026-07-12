import React from 'react';
import { motion } from 'motion/react';
import { checkPasswordStrength } from '../lib/passwordStrength';
import { Check, AlertCircle } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const result = checkPasswordStrength(password);
  const { score, label, color, textColor, criteria } = result;

  const requirements = [
    { label: 'At least 8 characters', met: criteria.hasMinLength },
    { label: 'At least 1 lowercase letter', met: criteria.hasLower },
    { label: 'At least 1 uppercase letter', met: criteria.hasUpper },
    { label: 'At least 1 number', met: criteria.hasNumber },
    { label: 'At least 1 special character', met: criteria.hasSpecial },
  ];

  if (!password) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3 p-4 border border-white/5 bg-black/40 rounded-xl shadow-inner mt-2"
    >
      {/* Label and Score Row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Security Assessment</span>
        <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 ${textColor}`}>
          {label}
        </span>
      </div>

      {/* Progress Bars (Segmented) */}
      <div className="grid grid-cols-5 gap-1.5 h-1">
        {[1, 2, 3, 4, 5].map((idx) => {
          const isActive = score >= idx;
          return (
            <div 
              key={idx} 
              className={`h-full rounded-full transition-all duration-500 ${
                isActive ? color : 'bg-white/10'
              }`}
            />
          );
        })}
      </div>

      {/* Specific requirements checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
        {requirements.map((req, i) => (
          <div key={i} className="flex items-center space-x-2 text-[10px] font-medium">
            {req.met ? (
              <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Check className="w-2.5 h-2.5" />
              </span>
            ) : (
              <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/5 border border-white/5 text-white/20">
                <AlertCircle className="w-2.5 h-2.5" />
              </span>
            )}
            <span className={`transition-colors duration-300 ${req.met ? 'text-emerald-400' : 'text-white/40'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
