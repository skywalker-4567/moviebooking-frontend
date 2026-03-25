import { useState, useEffect } from 'react';
import { createTheatre, getMyTheatres, createScreen, createSeat } from '../../api/owner';

const TABS = ['My Theatres', 'Add Theatre', 'Add Screen', 'Add Seats'];

export default function OwnerPanel() {
  const [activeTab, setActiveTab] = useState('My Theatres');
  const [theatres, setTheatres] = useState([]);
  const [loadingTheatres, setLoadingTheatres] = useState(true);

  useEffect(() => {
    fetchTheatres();
  }, []);

  const fetchTheatres = async () => {
    setLoadingTheatres(true);
    try {
      const res = await getMyTheatres();
      setTheatres(res.data);
    } catch {
      // fail silently
    } finally {
      setLoadingTheatres(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Owner Panel</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your theatres, screens and seats</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'My Theatres' && (
          <MyTheatresList
            theatres={theatres}
            loading={loadingTheatres}
            onRefresh={fetchTheatres}
          />
        )}
        {activeTab === 'Add Theatre' && (
          <AddTheatreForm onSuccess={() => { fetchTheatres(); setActiveTab('My Theatres'); }} />
        )}
        {activeTab === 'Add Screen' && (
          <AddScreenForm theatres={theatres} />
        )}
        {activeTab === 'Add Seats' && (
          <AddSeatsForm theatres={theatres} />
        )}
      </div>
    </div>
  );
}

// ── My Theatres List ──────────────────────────────────────────
function MyTheatresList({ theatres, loading, onRefresh }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-zinc-900 rounded-xl h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (theatres.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🏛️</p>
        <p className="text-zinc-400 font-medium">No theatres yet</p>
        <p className="text-zinc-600 text-sm mt-1">Create your first theatre to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {theatres.map((theatre) => (
        <div key={theatre.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white font-semibold text-lg">{theatre.name}</h3>
              <p className="text-zinc-500 text-sm mt-0.5">📍 {theatre.address}, {theatre.city}</p>
              {theatre.totalScreens && (
                <p className="text-zinc-600 text-xs mt-1">{theatre.totalScreens} screens</p>
              )}
            </div>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
              ID: {theatre.id}
            </span>
          </div>
        </div>
      ))}
      <button
        onClick={onRefresh}
        className="text-zinc-500 hover:text-white text-sm mt-2"
      >
        ↻ Refresh
      </button>
    </div>
  );
}

// ── Add Theatre Form ──────────────────────────────────────────
function AddTheatreForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: '', address: '', city: '', state: '', pincode: '', phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createTheatre(form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create theatre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <ErrorBox message={error} />}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Theatre Name" name="name" value={form.name}
          onChange={handleChange} required span2 />
        <Field label="Address" name="address" value={form.address}
          onChange={handleChange} required span2 />
        <Field label="City" name="city" value={form.city}
          onChange={handleChange} required />
        <Field label="State" name="state" value={form.state}
          onChange={handleChange} required />
        <Field label="Pincode" name="pincode" value={form.pincode}
          onChange={handleChange} />
        <Field label="Phone" name="phone" value={form.phone}
          onChange={handleChange} />
      </div>
      <SubmitButton loading={loading} label="Create Theatre" />
    </form>
  );
}

// ── Add Screen Form ───────────────────────────────────────────
function AddScreenForm({ theatres }) {
  const [form, setForm] = useState({
    theatreId: '', name: '', totalSeats: '', screenType: 'STANDARD',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await createScreen({
        ...form,
        theatreId: Number(form.theatreId),
        totalSeats: Number(form.totalSeats),
      });
      setSuccess(`Screen "${res.data.name}" created! Screen ID: ${res.data.id}`);
      setForm({ theatreId: '', name: '', totalSeats: '', screenType: 'STANDARD' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create screen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && <SuccessBox message={success} />}
      {error && <ErrorBox message={error} />}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-zinc-400 text-sm block mb-1.5">Theatre</label>
          <select
            name="theatreId"
            value={form.theatreId}
            onChange={handleChange}
            required
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="">Select your theatre</option>
            {theatres.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <Field label="Screen Name" name="name" value={form.name}
          onChange={handleChange} required placeholder="e.g. Screen 1, Audi 2" />
        <Field label="Total Seats" name="totalSeats" type="number"
          value={form.totalSeats} onChange={handleChange} required />
        <div className="col-span-2">
          <label className="text-zinc-400 text-sm block mb-1.5">Screen Type</label>
          <select
            name="screenType"
            value={form.screenType}
            onChange={handleChange}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
          >
            {['STANDARD', 'IMAX', '3D', '4DX'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <SubmitButton loading={loading} label="Create Screen" />
    </form>
  );
}

// ── Add Seats Form ────────────────────────────────────────────
function AddSeatsForm({ theatres }) {
  const [theatreId, setTheatreId] = useState('');
  const [screens, setScreens] = useState([]);
  const [form, setForm] = useState({
    screenId: '', rowLabel: '', startSeatNumber: '1',
    endSeatNumber: '', seatType: 'REGULAR', price: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleTheatreChange = async (e) => {
    setTheatreId(e.target.value);
    setForm({ ...form, screenId: '' });
    try {
      const { getScreensByTheatre } = await import('../../api/admin');
      const res = await getScreensByTheatre(e.target.value);
      setScreens(res.data);
    } catch {
      setScreens([]);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Create seats for a range e.g. A1–A10
      const start = Number(form.startSeatNumber);
      const end = Number(form.endSeatNumber);

      // Send bulk or loop — adjust based on your backend
      // If your backend accepts a single seat at a time:
      const promises = [];
      for (let i = start; i <= end; i++) {
        promises.push(createSeat({
          screenId: Number(form.screenId),
          rowLabel: form.rowLabel.toUpperCase(),
          seatNumber: i,
          seatType: form.seatType,
          price: Number(form.price),
        }));
      }
      await Promise.all(promises);
      const count = end - start + 1;
      setSuccess(`${count} seats created (Row ${form.rowLabel.toUpperCase()}, ${start}–${end})`);
      setForm({ ...form, rowLabel: '', startSeatNumber: '1', endSeatNumber: '', price: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create seats');
    } finally {
      setLoading(false);
    }
  };

  const seatCount = form.endSeatNumber && form.startSeatNumber
    ? Number(form.endSeatNumber) - Number(form.startSeatNumber) + 1
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && <SuccessBox message={success} />}
      {error && <ErrorBox message={error} />}

      {/* Tip box */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-400">
        <p className="font-medium text-zinc-300 mb-1">💡 How seat creation works</p>
        <p>Pick a screen, set a row label (A, B, C...) and a seat number range. All seats in that range will be created at once.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Theatre */}
        <div>
          <label className="text-zinc-400 text-sm block mb-1.5">Theatre</label>
          <select
            value={theatreId}
            onChange={handleTheatreChange}
            required
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="">Select theatre</option>
            {theatres.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Screen */}
        <div>
          <label className="text-zinc-400 text-sm block mb-1.5">Screen</label>
          <select
            name="screenId"
            value={form.screenId}
            onChange={handleChange}
            required
            disabled={!theatreId}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 disabled:opacity-40"
          >
            <option value="">Select screen</option>
            {screens.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <Field label="Row Label" name="rowLabel" value={form.rowLabel}
          onChange={handleChange} required placeholder="A" />

        <div>
          <label className="text-zinc-400 text-sm block mb-1.5">Seat Type</label>
          <select
            name="seatType"
            value={form.seatType}
            onChange={handleChange}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
          >
            {['REGULAR', 'PREMIUM', 'RECLINER'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <Field label="Start Seat No." name="startSeatNumber" type="number"
          value={form.startSeatNumber} onChange={handleChange} required />
        <Field label="End Seat No." name="endSeatNumber" type="number"
          value={form.endSeatNumber} onChange={handleChange} required />
        <Field label="Price per Seat (₹)" name="price" type="number"
          value={form.price} onChange={handleChange} required span2 />
      </div>

      {seatCount > 0 && (
        <p className="text-amber-400 text-sm">
          → Will create <strong>{seatCount}</strong> seats in Row {form.rowLabel?.toUpperCase() || '?'}
        </p>
      )}

      <SubmitButton loading={loading} label={`Create ${seatCount > 0 ? seatCount : ''} Seats`} />
    </form>
  );
}

// ── Reusable Components ───────────────────────────────────────
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

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold px-8 py-3 rounded-xl"
    >
      {loading ? 'Creating...' : label}
    </button>
  );
}

function SuccessBox({ message }) {
  return (
    <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
      ✅ {message}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
      {message}
    </div>
  );
}