/**
 * Password Strength Meter Component
 * Shows visual feedback for password strength
 */
'use client';

import React, { useMemo } from 'react';

export interface PasswordStrengthResult {
  score: number; // 0-4
  label: 'weak' | 'medium' | 'strong';
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
}

export interface PasswordStrengthProps {
  password: string;
  showDetails?: boolean;
}

/**
 * Analyze password strength
 */
export function analyzePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  // Calculate score (0-4)
  let score = 0;
  if (checks.length) score++;
  if (checks.uppercase) score++;
  if (checks.lowercase) score++;
  if (checks.number) score++;
  if (checks.specialChar) score++;

  // Determine label
  let label: 'weak' | 'medium' | 'strong';
  if (score <= 2) {
    label = 'weak';
  } else if (score <= 3) {
    label = 'medium';
  } else {
    label = 'strong';
  }

  return { score, label, checks };
}

/**
 * Get color class based on strength
 */
function getStrengthColor(score: number): string {
  if (score <= 2) return 'bg-danger';
  if (score <= 3) return 'bg-warning';
  return 'bg-success';
}

/**
 * Get label text based on strength
 */
function getStrengthLabel(score: number): string {
  if (score === 0) return 'Enter a password';
  if (score <= 2) return 'Weak';
  if (score <= 3) return 'Medium';
  return 'Strong';
}

export default function PasswordStrength({ password, showDetails = true }: PasswordStrengthProps) {
  const result = useMemo(() => analyzePasswordStrength(password), [password]);
  const { score, checks } = result;

  // Don't show anything if password is empty
  if (!password) {
    return null;
  }

  return (
    <div className="password-strength mt-2" data-testid="password-strength">
      {/* Strength bar */}
      <div className="mb-2">
        <div className="d-flex justify-content-between mb-1">
          <small className="text-muted">Password strength</small>
          <small className={`fw-bold ${score <= 2 ? 'text-danger' : score <= 3 ? 'text-warning' : 'text-success'}`}>
            {getStrengthLabel(score)}
          </small>
        </div>
        <div className="progress" style={{ height: '6px' }} role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={4} aria-label="Password strength">
          <div
            className={`progress-bar ${getStrengthColor(score)}`}
            style={{ width: `${(score / 4) * 100}%`, transition: 'width 0.3s ease' }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showDetails && (
        <div className="password-requirements">
          <small className="text-muted d-block mb-1">Requirements:</small>
          <ul className="list-unstyled mb-0" style={{ fontSize: '0.75rem' }}>
            <li className={checks.length ? 'text-success' : 'text-muted'}>
              <span aria-hidden="true">{checks.length ? '✓' : '○'}</span> At least 8 characters
            </li>
            <li className={checks.uppercase ? 'text-success' : 'text-muted'}>
              <span aria-hidden="true">{checks.uppercase ? '✓' : '○'}</span> One uppercase letter
            </li>
            <li className={checks.lowercase ? 'text-success' : 'text-muted'}>
              <span aria-hidden="true">{checks.lowercase ? '✓' : '○'}</span> One lowercase letter
            </li>
            <li className={checks.number ? 'text-success' : 'text-muted'}>
              <span aria-hidden="true">{checks.number ? '✓' : '○'}</span> One number
            </li>
            <li className={checks.specialChar ? 'text-success' : 'text-muted'}>
              <span aria-hidden="true">{checks.specialChar ? '✓' : '○'}</span> One special character (!@#$%^&*...)
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
