import { useState } from 'react';
import { createMovie, createShow, getTheatres, getScreensByTheatre } from '../../api/admin';
import { getMovies } from '../../api/movies';

const TABS = ['Create Movie', 'Create Show'];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('Create Movie');

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage movies and shows</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Create Movie' && <CreateMovieForm />}
        {activeTab === 'Create Show' && <CreateShowForm />}
      </div>
    </div>
  );
}

// ── Create Movie Form ─────────────────────────────────────────
function CreateMovieForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    genre: '',
    language: '',
    durationMinutes: '',
    releaseDate: '',
    certification: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await createMovie({
        ...form,
        durationMinutes: Number(form.durationMinutes),
      });
      setSuccess(`Movie "${res.data.title}" created successfully!`);
      setForm({
        title: '', description: '', genre: '', language: '',
        durationMinutes: '', releaseDate: '', certification: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Title" name="title" value={form.title} onChange={handleChange} required span2 />
        <Field label="Genre" name="genre" value={form.genre} onChange={handleChange} required />
        <Field label="Language" name="language" value={form.language} onChange={handleChange} required />
        <Field label="Duration (minutes)" name="durationMinutes" type="number"
          value={form.durationMinutes} onChange={handleChange} required />
        <Field label="Release Date" name="releaseDate" type="date"
          value={form.releaseDate} onChange={handleChange} required />
        <Field label="Certification" name="certification" value={form.certification}
          onChange={handleChange} placeholder="U, UA, A" />
      </div>

      <div>
        <label className="text-zinc-400 text-sm block mb-1.5">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Movie synopsis..."
          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold px-8 py-3 rounded-xl"
      >
        {loading ? 'Creating...' : 'Create Movie'}
      </button>
    </form>
  );
}

// ── Create Show Form ──────────────────────────────────────────
function CreateShowForm() {
  const [form, setForm] = useState({
    movieId: '',
    theatreId: '',
    screenId: '',
    showDate: '',
    showTime: '',
    price: '',
    format: 'STANDARD',
  });
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Load movies + theatres on mount
  useState(() => {
    const fetchInitial = async () => {
      try {
        const [moviesRes, theatresRes] = await Promise.all([
          getMovies(0, 100),
          getTheatres(),
        ]);
        setMovies(moviesRes.data.content ?? moviesRes.data);
        setTheatres(theatresRes.data);
      } catch {
        setError('Failed to load movies or theatres');
      }
    };
    fetchInitial();
  }, []);

  // Load screens when theatre changes
  const handleTheatreChange = async (e) => {
    const theatreId = e.target.value;
    setForm({ ...form, theatreId, screenId: '' });
    if (!theatreId) return;
    try {
      const res = await getScreensByTheatre(theatreId);
      setScreens(res.data);
    } catch {
      setScreens([]);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createShow({
        ...form,
        movieId: Number(form.movieId),
        screenId: Number(form.screenId),
        price: Number(form.price),
      });
      setSuccess('Show created successfully!');
      setForm({
        movieId: '', theatreId: '', screenId: '',
        showDate: '', showTime: '', price: '', format: 'STANDARD',
      });
      setScreens([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create show');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Movie dropdown */}
        <div className="col-span-2">
          <label className="text-zinc-400 text-sm block mb-1.5">Movie</label>
          <select
            name="movieId"
            value={form.movieId}
            onChange={handleChange}
            required
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="">Select a movie</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        {/* Theatre dropdown */}
        <div>
          <label className="text-zinc-400 text-sm block mb-1.5">Theatre</label>
          <select
            name="theatreId"
            value={form.theatreId}
            onChange={handleTheatreChange}
            required
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="">Select a theatre</option>
            {theatres.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Screen dropdown — loads after theatre selected */}
        <div>
          <label className="text-zinc-400 text-sm block mb-1.5">Screen</label>
          <select
            name="screenId"
            value={form.screenId}
            onChange={handleChange}
            required
            disabled={!form.theatreId}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 disabled:opacity-40"
          >
            <option value="">Select a screen</option>
            {screens.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <Field label="Show Date" name="showDate" type="date"
          value={form.showDate} onChange={handleChange} required />
        <Field label="Show Time" name="showTime" type="time"
          value={form.showTime} onChange={handleChange} required />
        <Field label="Price (₹)" name="price" type="number"
          value={form.price} onChange={handleChange} required />

        <div>
          <label className="text-zinc-400 text-sm block mb-1.5">Format</label>
          <select
            name="format"
            value={form.format}
            onChange={handleChange}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
          >
            {['STANDARD', '3D', 'IMAX', '4DX'].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold px-8 py-3 rounded-xl"
      >
        {loading ? 'Creating...' : 'Create Show'}
      </button>
    </form>
  );
}

// ── Reusable Field ────────────────────────────────────────────
function Field({ label, name, type = 'text', value, onChange, required, placeholder, span2 }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className="text-zinc-400 text-sm block mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
      />
    </div>
  );
}