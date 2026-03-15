/**
 * Register Page Component Tests
 */
import { render, screen, fireEvent, waitFor } from '../utils/render';
import RegisterPage from '@/app/register/page';
import { authService } from '@/services/authService';

// Mock the authService
jest.mock('@/services/authService', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render registration form', () => {
    render(<RegisterPage />);
    
    expect(screen.getByTestId('register-page')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('should render heading', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByText('Sign up to get started')).toBeInTheDocument();
  });

  it('should have email input with correct attributes', () => {
    render(<RegisterPage />);
    
    const emailInput = screen.getByLabelText(/Email address/i);
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
    expect(emailInput).toHaveAttribute('autocomplete', 'email');
    expect(emailInput).toHaveAttribute('required');
  });

  it('should have password input with correct attributes', () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('placeholder', 'Create a strong password');
    expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('should have confirm password input', () => {
    render(<RegisterPage />);
    
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    expect(confirmInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('placeholder', 'Confirm your password');
    expect(confirmInput).toHaveAttribute('autocomplete', 'new-password');
    expect(confirmInput).toHaveAttribute('required');
  });

  it('should have show/hide password toggle button', () => {
    render(<RegisterPage />);
    
    const toggleButton = screen.getByLabelText('Show password');
    expect(toggleButton).toBeInTheDocument();
  });

  it('should toggle password visibility', () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByLabelText('Show password');
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
  });

  it('should show email validation error for invalid email', async () => {
    render(<RegisterPage />);
    
    const emailInput = screen.getByLabelText(/Email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should show password requirements when typing', () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'Test' } });
    
    expect(screen.getByText('Requirements:')).toBeInTheDocument();
  });

  it('should show password strength meter when typing', () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
    
    expect(screen.getByTestId('password-strength')).toBeInTheDocument();
  });

  it('should show weak strength for simple password', () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'abc' } });
    
    expect(screen.getByText('Weak')).toBeInTheDocument();
  });

  it('should show strong strength for complex password', () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
    
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('should show password mismatch error', async () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    
    fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Different123!' } });
    fireEvent.blur(confirmInput);
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('should show passwords match confirmation', () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    
    fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Test123!' } });
    
    expect(screen.getByText('✓ Passwords match')).toBeInTheDocument();
  });

  it('should show validation error for missing password length', async () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'Test' } });
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/)).toBeInTheDocument();
    });
  });

  it('should show validation error for missing uppercase', async () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'test123!' } });
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.getByText(/one uppercase letter/)).toBeInTheDocument();
    });
  });

  it('should show validation error for missing lowercase', async () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'TEST123!' } });
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.getByText(/one lowercase letter/)).toBeInTheDocument();
    });
  });

  it('should show validation error for missing number', async () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'Testtest!' } });
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.getByText(/one number/)).toBeInTheDocument();
    });
  });

  it('should show validation error for missing special character', async () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.getByText(/one special character/)).toBeInTheDocument();
    });
  });

  it('should disable submit button when password is weak', () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    
    const submitButton = screen.getByTestId('register-submit');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when password is strong', () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    
    fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Test123!' } });
    
    const submitButton = screen.getByTestId('register-submit');
    expect(submitButton).not.toBeDisabled();
  });

  it('should show loading state when submitting', async () => {
    (authService.register as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<RegisterPage />);
    
    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByTestId('register-submit');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Test123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Creating account...')).toBeInTheDocument();
    });

    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should call register with correct credentials on valid submit', async () => {
    (authService.register as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    });
    (authService.login as jest.Mock).mockResolvedValue({
      access_token: 'test-token',
      user: { id: '1', email: 'test@example.com' },
    });
    
    render(<RegisterPage />);
    
    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByTestId('register-submit');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Test123!' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith('test@example.com', 'Test123!');
    });
  });

  it('should show error alert on registration failure', async () => {
    (authService.register as jest.Mock).mockRejectedValue(new Error('Email already exists'));
    
    render(<RegisterPage />);
    
    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByTestId('register-submit');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Test123!' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('register-error')).toBeInTheDocument();
    });
    expect(screen.getByText('Email already exists')).toBeInTheDocument();
  });

  it('should have dismissible error alert', async () => {
    (authService.register as jest.Mock).mockRejectedValue(new Error('Email already exists'));
    
    render(<RegisterPage />);
    
    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByTestId('register-submit');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Test123!' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('register-error')).toBeInTheDocument();
    });
    
    const dismissButton = screen.getByLabelText('Dismiss error');
    fireEvent.click(dismissButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Email already exists')).not.toBeInTheDocument();
    });
  });

  it('should show link to login page', () => {
    render(<RegisterPage />);
    
    const loginLink = screen.getByText('Sign in');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should show password requirements summary', () => {
    render(<RegisterPage />);
    
    expect(screen.getByText(/Password must contain: at least 8 characters/)).toBeInTheDocument();
  });

  it('should disable inputs when submitting', async () => {
    (authService.register as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByTestId('register-submit');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Test123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(confirmInput).toBeDisabled();
    });
  });

  it('should clear validation error when user starts typing', async () => {
    render(<RegisterPage />);
    
    const emailInput = screen.getByLabelText(/Email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
    
    fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
    });
  });

  it('should have proper ARIA attributes on form', () => {
    render(<RegisterPage />);
    
    const emailInput = screen.getByLabelText(/Email address/i);
    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
  });
});
