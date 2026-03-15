/**
 * Register page component with enhanced password validation
 */
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import PasswordStrength, { analyzePasswordStrength } from '../../components/PasswordStrength';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const { register, error, clearError } = useAuth();
  const router = useRouter();

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setFormErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    if (!emailRegex.test(email)) {
      setFormErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    }
    setFormErrors((prev) => ({ ...prev, email: undefined }));
    return true;
  };

  // Check password requirements
  const getPasswordRequirements = (pwd: string) => {
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    };
  };

  // Validate password
  const validatePassword = (pwd: string): boolean => {
    if (!pwd) {
      setFormErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return false;
    }

    const requirements = getPasswordRequirements(pwd);
    const missingRequirements: string[] = [];

    if (!requirements.length) missingRequirements.push('at least 8 characters');
    if (!requirements.uppercase) missingRequirements.push('one uppercase letter');
    if (!requirements.lowercase) missingRequirements.push('one lowercase letter');
    if (!requirements.number) missingRequirements.push('one number');
    if (!requirements.specialChar) missingRequirements.push('one special character');

    if (missingRequirements.length > 0) {
      setFormErrors((prev) => ({
        ...prev,
        password: `Password must contain: ${missingRequirements.join(', ')}`,
      }));
      return false;
    }

    setFormErrors((prev) => ({ ...prev, password: undefined }));
    return true;
  };

  // Validate confirm password
  const validateConfirmPassword = (pwd: string, confirm: string): boolean => {
    if (!confirm) {
      setFormErrors((prev) => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      return false;
    }
    if (pwd !== confirm) {
      setFormErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return false;
    }
    setFormErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    return true;
  };

  const handleEmailBlur = () => {
    validateEmail(email);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPwd = e.target.value;
    setPassword(newPwd);
    if (formErrors.password) {
      setFormErrors((prev) => ({ ...prev, password: undefined }));
    }
    // Re-validate confirm password if it was entered
    if (confirmPassword) {
      validateConfirmPassword(newPwd, confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirm = e.target.value;
    setConfirmPassword(newConfirm);
    validateConfirmPassword(password, newConfirm);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setFormErrors({});

    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(password, confirmPassword);

    if (!isEmailValid || !isPasswordValid || !isConfirmValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password);
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by AuthContext with toast
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setFormErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = analyzePasswordStrength(password);

  return (
    <div className="container mt-5" data-testid="register-page">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h1 className="card-title h3">Create Account</h1>
                <p className="text-muted">Sign up to get started</p>
              </div>

              {/* General error alert */}
              {(error || formErrors.general) && (
                <div 
                  className="alert alert-danger alert-dismissible fade show" 
                  role="alert" 
                  data-testid="register-error"
                  aria-live="assertive"
                >
                  {formErrors.general || error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      clearError();
                      setFormErrors((prev) => ({ ...prev, general: undefined }));
                    }}
                    aria-label="Dismiss error"
                    data-bs-dismiss="alert"
                  />
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    onBlur={handleEmailBlur}
                    required
                    disabled={isSubmitting}
                    placeholder="you@example.com"
                    aria-invalid={!!formErrors.email}
                    aria-describedby={formErrors.email ? 'email-error' : undefined}
                    autoComplete="email"
                  />
                  {formErrors.email && (
                    <div id="email-error" className="invalid-feedback" role="alert">
                      {formErrors.email}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                      id="password"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      disabled={isSubmitting}
                      placeholder="Create a strong password"
                      aria-invalid={!!formErrors.password}
                      aria-describedby={formErrors.password ? 'password-error' : 'password-help'}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <span aria-hidden="true">🙈</span>
                      ) : (
                        <span aria-hidden="true">👁</span>
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <div id="password-error" className="invalid-feedback d-block" role="alert">
                      {formErrors.password}
                    </div>
                  )}
                  
                  {/* Password strength meter */}
                  <PasswordStrength password={password} showDetails={true} />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    disabled={isSubmitting}
                    placeholder="Confirm your password"
                    aria-invalid={!!formErrors.confirmPassword}
                    aria-describedby={formErrors.confirmPassword ? 'confirm-password-error' : undefined}
                    autoComplete="new-password"
                  />
                  {formErrors.confirmPassword && (
                    <div id="confirm-password-error" className="invalid-feedback" role="alert">
                      {formErrors.confirmPassword}
                    </div>
                  )}
                  {confirmPassword && !formErrors.confirmPassword && password === confirmPassword && (
                    <div className="form-text text-success">
                      <small>✓ Passwords match</small>
                    </div>
                  )}
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || passwordStrength.score < 4}
                    aria-busy={isSubmitting}
                    data-testid="register-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>

                {/* Password requirements summary */}
                <div className="mt-3">
                  <small className="text-muted">
                    Password must contain: at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.
                  </small>
                </div>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <span className="text-muted">Already have an account?</span>{' '}
                <Link href="/login" className="text-decoration-none fw-medium">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
