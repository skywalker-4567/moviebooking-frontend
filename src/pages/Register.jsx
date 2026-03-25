import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../api/auth';

const ROLES = ['CUSTOMER', 'THEATRE_OWNER'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
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
      const res = await registerApi(form);
      const { token, ...user } = res.data;
login(user, token);
      if (user.role === 'THEATRE_OWNER') navigate('/owner');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-3xl font-bold mb-2">Create account</h1>
        <p className="text-zinc-400 mb-8">Start booking in seconds</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Name', name: 'name', type: 'text', placeholder: 'John Doe' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="text-zinc-400 text-sm block mb-1.5">{label}</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
                placeholder={placeholder}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500"
              />
            </div>
          ))}

          <div>
            <label className="text-zinc-400 text-sm block mb-1.5">I am a...</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r === 'CUSTOMER' ? 'Customer' : 'Theatre Owner'}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg mt-2"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-zinc-500 text-sm text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}