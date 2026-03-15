/**
 * PasswordStrength Component Tests
 */
import { render, screen } from '../utils/render';
import PasswordStrength, { analyzePasswordStrength } from '@/components/PasswordStrength';

describe('PasswordStrength', () => {
  describe('analyzePasswordStrength function', () => {
    it('should return weak for empty password', () => {
      const result = analyzePasswordStrength('');
      expect(result.score).toBe(0);
      expect(result.label).toBe('weak');
    });

    it('should return weak for short password', () => {
      const result = analyzePasswordStrength('abc');
      expect(result.score).toBe(1); // only lowercase
      expect(result.label).toBe('weak');
    });

    it('should return weak for password with only length', () => {
      const result = analyzePasswordStrength('abcdefgh');
      expect(result.score).toBe(2); // length + lowercase
      expect(result.label).toBe('weak');
    });

    it('should return medium for password with 3 criteria', () => {
      const result = analyzePasswordStrength('Abcdefgh');
      expect(result.score).toBe(3); // length + lowercase + uppercase
      expect(result.label).toBe('medium');
    });

    it('should return strong for password with all criteria', () => {
      const result = analyzePasswordStrength('Abcdefgh1!');
      expect(result.score).toBe(5); // all criteria
      expect(result.label).toBe('strong');
    });

    it('should correctly identify all password criteria', () => {
      const result = analyzePasswordStrength('Test123!');
      expect(result.checks.length).toBe(true);
      expect(result.checks.uppercase).toBe(true);
      expect(result.checks.lowercase).toBe(true);
      expect(result.checks.number).toBe(true);
      expect(result.checks.specialChar).toBe(true);
    });

    it('should identify missing criteria', () => {
      const result = analyzePasswordStrength('test');
      expect(result.checks.length).toBe(false);
      expect(result.checks.uppercase).toBe(false);
      expect(result.checks.lowercase).toBe(true);
      expect(result.checks.number).toBe(false);
      expect(result.checks.specialChar).toBe(false);
    });
  });

  describe('PasswordStrength component', () => {
    it('should not render when password is empty', () => {
      render(<PasswordStrength password="" />);
      expect(screen.queryByTestId('password-strength')).not.toBeInTheDocument();
    });

    it('should render password strength meter', () => {
      render(<PasswordStrength password="Test123!" />);
      expect(screen.getByTestId('password-strength')).toBeInTheDocument();
    });

    it('should show weak strength for simple password', () => {
      render(<PasswordStrength password="abc" />);
      expect(screen.getByText('Weak')).toBeInTheDocument();
    });

    it('should show medium strength for moderate password', () => {
      render(<PasswordStrength password="Abcdefgh" />);
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('should show strong strength for complex password', () => {
      render(<PasswordStrength password="Test123!" />);
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });

    it('should show progress bar', () => {
      render(<PasswordStrength password="Test123!" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '5');
    });

    it('should show requirements checklist when showDetails is true', () => {
      render(<PasswordStrength password="Test123!" showDetails={true} />);
      expect(screen.getByText('Requirements:')).toBeInTheDocument();
      expect(screen.getByText(/At least 8 characters/)).toBeInTheDocument();
      expect(screen.getByText(/One uppercase letter/)).toBeInTheDocument();
      expect(screen.getByText(/One lowercase letter/)).toBeInTheDocument();
      expect(screen.getByText(/One number/)).toBeInTheDocument();
      expect(screen.getByText(/One special character/)).toBeInTheDocument();
    });

    it('should hide requirements checklist when showDetails is false', () => {
      render(<PasswordStrength password="Test123!" showDetails={false} />);
      expect(screen.queryByText('Requirements:')).not.toBeInTheDocument();
    });

    it('should show checkmark for met criteria', () => {
      render(<PasswordStrength password="Test123!" />);
      const checks = screen.getAllByText('✓');
      expect(checks.length).toBe(5); // All criteria met
    });

    it('should show circle for unmet criteria', () => {
      render(<PasswordStrength password="test" />);
      const circles = screen.getAllByText('○');
      expect(circles.length).toBe(4); // 4 criteria not met
    });

    it('should have correct color for weak password', () => {
      render(<PasswordStrength password="abc" />);
      const progressBar = screen.getByRole('progressbar').firstChild as HTMLElement;
      expect(progressBar).toHaveClass('bg-danger');
    });

    it('should have correct color for medium password', () => {
      render(<PasswordStrength password="Abcdefgh" />);
      const progressBar = screen.getByRole('progressbar').firstChild as HTMLElement;
      expect(progressBar).toHaveClass('bg-warning');
    });

    it('should have correct color for strong password', () => {
      render(<PasswordStrength password="Test123!" />);
      const progressBar = screen.getByRole('progressbar').firstChild as HTMLElement;
      expect(progressBar).toHaveClass('bg-success');
    });
  });
});
