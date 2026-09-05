import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [portfolioId, setPortfolioId] = useState('');
  const [error, setError] = useState('');
  const [portfolioError, setPortfolioError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const { signIn, resendConfirmationEmail } = useAuth();
  const navigate = useNavigate();

  const VALID_PORTFOLIO_ID = 'Q7M4-X9D2-K8A1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPortfolioError('');
    setResendSuccess('');

    if (!portfolioId.trim()) {
      setPortfolioError('Portfolio ID is required');
      return;
    }

    if (portfolioId.trim() !== VALID_PORTFOLIO_ID) {
      setPortfolioError('Invalid Portfolio ID');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      const message = err.message || 'Failed to sign in';
      if (message.includes('Email not confirmed')) {
        setError('Please confirm your email before signing in. Check your inbox for the confirmation link.');
      } else if (message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setResending(true);
    setError('');
    setResendSuccess('');
    try {
      await resendConfirmationEmail(email);
      setResendSuccess('Confirmation email sent! Please check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p>Sign in to access your portfolio</p>

        {error && <div className="auth-error">{error}</div>}
        {portfolioError && <div className="auth-error">{portfolioError}</div>}
        {resendSuccess && <div className="auth-success">{resendSuccess}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="portfolioId">Portfolio ID</label>
            <input
              id="portfolioId"
              type="text"
              value={portfolioId}
              onChange={(e) => setPortfolioId(e.target.value)}
              required
              placeholder="XXXX-XXXX-XXXX"
              maxLength={14}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
        <p className="auth-footer">
          Didn't receive a confirmation email?{' '}
          <button
            type="button"
            className="auth-link-button"
            onClick={handleResendConfirmation}
            disabled={resending}
          >
            {resending ? 'Sending...' : 'Resend confirmation email'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
