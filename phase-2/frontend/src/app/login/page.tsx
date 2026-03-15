/**
 * Login page component with enhanced UX
 */
'use client';

import { useState, Suspense, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Inner component that uses useSearchParams (wrapped in Suspense)
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const { login, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

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

  // Validate password
  const validatePassword = (pwd: string): boolean => {
    if (!pwd) {
      setFormErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    if (pwd.length < 1) {
      setFormErrors((prev) => ({ ...prev, password: 'Password must be at least 1 character' }));
      return false;
    }
    setFormErrors((prev) => ({ ...prev, password: undefined }));
    return true;
  };

  const handleEmailBlur = () => {
    validateEmail(email);
  };

  const handlePasswordBlur = () => {
    validatePassword(password);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setFormErrors({});

    // Validate form
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push(redirect);
    } catch (err) {
      // Error is handled by AuthContext with toast
      console.error('Login error:', err);
      // Set general error for display in alert
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setFormErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5" data-testid="login-page">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h1 className="card-title h3">Welcome Back</h1>
                <p className="text-muted">Sign in to your account</p>
              </div>

              {/* General error alert */}
              {(error || formErrors.general) && (
                <div 
                  className="alert alert-danger alert-dismissible fade show" 
                  role="alert" 
                  data-testid="login-error"
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
                  <input
                    type="password"
                    className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    onBlur={handlePasswordBlur}
                    required
                    disabled={isSubmitting}
                    placeholder="Enter your password"
                    aria-invalid={!!formErrors.password}
                    aria-describedby={formErrors.password ? 'password-error' : undefined}
                    autoComplete="current-password"
                  />
                  {formErrors.password && (
                    <div id="password-error" className="invalid-feedback" role="alert">
                      {formErrors.password}
                    </div>
                  )}
                </div>

                {/* Forgot password link */}
                <div className="mb-3 text-end">
                  <Link 
                    href="/password-reset" 
                    className="text-decoration-none small"
                    aria-label="Forgot your password? Reset it here"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <span className="text-muted">Don&apos;t have an account?</span>{' '}
                <Link href="/register" className="text-decoration-none fw-medium">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense boundary for useSearchParams
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
