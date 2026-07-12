export interface PasswordStrengthResult {
  score: number; // 0 to 5
  label: string;
  color: string;
  textColor: string;
  criteria: {
    hasMinLength: boolean;
    hasLower: boolean;
    hasUpper: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const criteria = {
    hasMinLength: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  let score = 0;
  if (criteria.hasMinLength) score++;
  if (criteria.hasLower) score++;
  if (criteria.hasUpper) score++;
  if (criteria.hasNumber) score++;
  if (criteria.hasSpecial) score++;

  let label = 'Very Weak';
  let color = 'bg-[#FF3B30]'; // Red
  let textColor = 'text-[#FF3B30]';

  if (password.length === 0) {
    label = 'Not Entered';
    color = 'bg-white/10';
    textColor = 'text-white/40';
  } else if (score <= 1) {
    label = 'Weak';
    color = 'bg-[#FF3B30]';
    textColor = 'text-[#FF3B30]';
  } else if (score === 2) {
    label = 'Fair';
    color = 'bg-amber-500';
    textColor = 'text-amber-500';
  } else if (score === 3) {
    label = 'Good';
    color = 'bg-yellow-400';
    textColor = 'text-yellow-400';
  } else if (score === 4) {
    label = 'Strong';
    color = 'bg-emerald-500';
    textColor = 'text-emerald-500';
  } else if (score === 5) {
    label = 'Excellent';
    color = 'bg-blue-500';
    textColor = 'text-blue-400';
  }

  return {
    score,
    label,
    color,
    textColor,
    criteria,
  };
}
