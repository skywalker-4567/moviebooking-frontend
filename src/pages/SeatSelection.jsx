import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { holdSeats } from '../api/bookings';
import api from '../api/axios';

const HOLD_DURATION = 10 * 60;

export default function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!state?.show) {
      setError('Show data missing. Please go back and try again.');
      setLoading(false);
      return;
    }
    setShow(state.show);
    fetchSeats(state.show);
  }, [showId]);

  // ← defined here now
  const fetchSeats = async (showData) => {
    try {
      // get screens for theatre, match by name to find screenId
      
      const theatresRes = await api.get('/api/theatres');
const theatres = Array.isArray(theatresRes.data)
  ? theatresRes.data
  : theatresRes.data.content ?? [];
const theatre = theatres.find((t) => t.name === showData.theatreName);
if (!theatre) throw new Error('Theatre not found');
const screensRes = await api.get(`/api/screens/theatre/${theatre.id}`);
const screens = Array.isArray(screensRes.data)
  ? screensRes.data
  : screensRes.data.content ?? [];
      const screen = screens.find((s) => s.name === showData.screenName);
      if (!screen) throw new Error('Screen not found');
      const seatsRes = await api.get(`/api/seats/screen/${screen.id}`);
      setSeats(Array.isArray(seatsRes.data) ? seatsRes.data : seatsRes.data.content ?? []);
    } catch {
      setError('Failed to load seats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      alert('Hold expired! Please select seats again.');
      navigate(0);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const toggleSeat = useCallback((seat) => {
    setSelected((prev) =>
      prev.includes(seat.id)
        ? prev.filter((id) => id !== seat.id)
        : [...prev, seat.id]
    );
  }, []);

  const handleHold = async () => {
    if (selected.length === 0) return;
    setHolding(true);
    setError('');
    try {
      await holdSeats({
        showId: Number(showId),
        showSeatIds: selected,
      });
      // hold returns a plain string, no bookingId yet — comes from confirm
      sessionStorage.setItem('holdData', JSON.stringify({
        showId,
        seatIds: selected,
        show,
        seats: seats.filter((s) => selected.includes(s.id)),
      }));
      setTimeLeft(HOLD_DURATION);
      navigate('/booking/confirm');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not hold seats. Try again.');
    } finally {
      setHolding(false);
    }
  };

  if (loading) return <SeatSkeleton />;
  if (error && !seats.length) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <p className="text-red-400">{error}</p>
      <button
        onClick={() => navigate(-1)}
        className="text-amber-400 hover:text-amber-300 text-sm"
      >
        ← Go back
      </button>
    </div>
  );

  const rows = groupByRow(seats);
  const selectedSeats = seats.filter((s) => selected.includes(s.id));
  const totalPrice = selectedSeats.reduce((sum, s) => sum + (s.price ?? 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-32">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-zinc-400 text-sm mb-0.5">
            {show?.theatreName} · {show?.screenName}
          </p>
          <h1 className="text-white text-xl font-bold">
            {show?.movieTitle} &mdash; {formatDateTime(show?.startTime)}
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">

        {/* Screen indicator */}
        <div className="mb-10">
          <div className="h-2 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full mx-auto w-2/3" />
          <p className="text-center text-zinc-500 text-xs mt-2 tracking-widest uppercase">Screen</p>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-8 text-xs text-zinc-400">
          {[
            { color: 'bg-zinc-700', label: 'Available' },
            { color: 'bg-amber-500', label: 'Selected' },
            { color: 'bg-zinc-600 opacity-40', label: 'Booked' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-sm ${color}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Seat Map */}
        <div className="space-y-2">
          {Object.entries(rows).map(([row, rowSeats]) => (
            <div key={row} className="flex items-center gap-2">
              <span className="text-zinc-600 text-xs w-5 text-right flex-shrink-0">{row}</span>
              <div className="flex gap-1.5 flex-wrap">
                {rowSeats.map((seat) => (
                  <Seat
                    key={seat.id}
                    seat={seat}
                    isSelected={selected.includes(seat.id)}
                    onClick={() => toggleSeat(seat)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mt-6">{error}</p>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            {selected.length === 0 ? (
              <p className="text-zinc-500 text-sm">Select seats to continue</p>
            ) : (
              <>
                <p className="text-white font-semibold">
                  {selected.length} seat{selected.length > 1 ? 's' : ''} · ₹{totalPrice}
                </p>
                <p className="text-zinc-500 text-xs">
                  {selectedSeats.map((s) => s.seatNumber).join(', ')}
                </p>
              </>
            )}
          </div>
          <button
            onClick={handleHold}
            disabled={selected.length === 0 || holding}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold px-8 py-3 rounded-xl text-sm"
          >
            {holding ? 'Holding...' : 'Hold Seats →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Seat Component ────────────────────────────────────────────
function Seat({ seat, isSelected, onClick }) {
  const isBooked = seat.status === 'BOOKED';
  return (
    <button
      onClick={onClick}
      disabled={isBooked}
      title={`${seat.seatNumber} · ${seat.seatType}`}
      className={`
        w-8 h-8 rounded-sm text-[10px] font-medium transition-all duration-100
        ${isBooked
          ? 'bg-zinc-700 opacity-30 cursor-not-allowed'
          : isSelected
            ? 'bg-amber-500 text-black scale-110 shadow-lg shadow-amber-500/30'
            : 'bg-zinc-700 hover:bg-zinc-500 text-zinc-300 cursor-pointer'
        }
      `}
    >
      {seat.seatNumber?.slice(1)}
    </button>
  );
}

// ── Helpers ───────────────────────────────────────────────────
function groupByRow(seats) {
  return seats.reduce((acc, seat) => {
    const row = seat.seatNumber?.charAt(0) ?? 'A';
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});
}

function formatDateTime(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleString('en-IN', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function SeatSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 animate-pulse">
      <div className="bg-zinc-900 h-20" />
      <div className="max-w-3xl mx-auto px-4 pt-12 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            {Array.from({ length: 12 }).map((_, j) => (
              <div key={j} className="w-8 h-8 bg-zinc-800 rounded-sm" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}