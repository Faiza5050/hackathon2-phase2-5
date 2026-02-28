/**
 * Register page component
 */
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

interface PasswordErrors {
  length?: string;
  uppercase?: string;
  lowercase?: string;
  number?: string;
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  
  const { register, error, clearError } = useAuth();
  const router = useRouter();

  const validatePassword = (pwd: string): boolean => {
    const errors: PasswordErrors = {};
    
    if (pwd.length < 8) {
      errors.length = 'At least 8 characters';
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.uppercase = 'One uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      errors.lowercase = 'One lowercase letter';
    }
    if (!/\d/.test(pwd)) {
      errors.number = 'One number';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPwd = e.target.value;
    setPassword(newPwd);
    validatePassword(newPwd);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordErrors({ ...passwordErrors, length: 'Passwords do not match' });
      return;
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-4">
              <h1 className="card-title text-center mb-4">Create Account</h1>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    disabled={isSubmitting}
                    placeholder="Create a strong password"
                  />
                  {Object.keys(passwordErrors).length > 0 && (
                    <div className="form-text text-danger mt-2">
                      <small>Password must contain:</small>
                      <ul className="mb-0 mt-1">
                        {passwordErrors.length && <li>{passwordErrors.length}</li>}
                        {passwordErrors.uppercase && <li>{passwordErrors.uppercase}</li>}
                        {passwordErrors.lowercase && <li>{passwordErrors.lowercase}</li>}
                        {passwordErrors.number && <li>{passwordErrors.number}</li>}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="Confirm your password"
                  />
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || Object.keys(passwordErrors).length > 0}
                  >
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                  </button>
                </div>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <span className="text-muted">Already have an account?</span>{' '}
                <Link href="/login" className="text-decoration-none">
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
