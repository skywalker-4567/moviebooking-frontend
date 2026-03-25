import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/auth';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginApi(form);
      // Adjust these field names to match your actual API response
     const { token, ...user } = res.data;
login(user, token);

      // Redirect based on role
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'THEATRE_OWNER') navigate('/owner');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-zinc-400 mb-8">Sign in to your account</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-zinc-400 text-sm block mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-zinc-400 text-sm block mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg mt-2"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-zinc-500 text-sm text-center mt-6">
          No account?{' '}
          <Link to="/register" className="text-amber-400 hover:text-amber-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}