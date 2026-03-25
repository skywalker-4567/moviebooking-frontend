import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../api/bookings';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null); // bookingId being cancelled
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const justBooked = location.state?.justBooked;

  useEffect(() => {
    fetchBookings();
    window.scrollTo(0, 0);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      setBookings(res.data.content ?? res.data);
    } catch {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Cancel this booking? This cannot be undone.')) return;
    setCancelling(bookingId);
    try {
      await cancelBooking(bookingId);
      // Update local state instead of refetching
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(null);
    }
  };

  // Group bookings by status
  const upcoming = bookings.filter((b) => b.status === 'CONFIRMED');
  const past = bookings.filter((b) => b.status === 'COMPLETED');
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED');

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Bookings</h1>
            <p className="text-zinc-500 text-sm mt-1">{bookings.length} total bookings</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm"
          >
            + Book More
          </button>
        </div>

        {/* Just booked banner */}
        {justBooked && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
            <span className="text-xl">🎉</span>
            <div>
              <p className="font-semibold">Booking confirmed!</p>
              <p className="text-sm text-green-500/80">Enjoy your movie.</p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-center py-10">{error}</p>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 rounded-xl h-36 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎬</p>
            <p className="text-zinc-400 text-lg font-medium">No bookings yet</p>
            <p className="text-zinc-600 text-sm mt-1 mb-6">Time to grab some seats!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-2.5 rounded-lg"
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <BookingGroup
              title="Upcoming"
              bookings={upcoming}
              cancelling={cancelling}
              onCancel={handleCancel}
              showCancel
            />
            <BookingGroup
              title="Completed"
              bookings={past}
              cancelling={cancelling}
              onCancel={handleCancel}
            />
            <BookingGroup
              title="Cancelled"
              bookings={cancelled}
              cancelling={cancelling}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Booking Group ─────────────────────────────────────────────
function BookingGroup({ title, bookings, cancelling, onCancel, showCancel }) {
  if (bookings.length === 0) return null;
  return (
    <div>
      <h2 className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">
        {title} ({bookings.length})
      </h2>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            cancelling={cancelling}
            onCancel={onCancel}
            showCancel={showCancel}
          />
        ))}
      </div>
    </div>
  );
}

// ── Booking Card ──────────────────────────────────────────────
function BookingCard({ booking, cancelling, onCancel, showCancel }) {
  const isCancelling = cancelling === booking.id;

  return (
    <div className={`bg-zinc-900 border rounded-xl p-5 transition-colors ${
      booking.status === 'CANCELLED'
        ? 'border-zinc-800 opacity-60'
        : 'border-zinc-800 hover:border-zinc-700'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Movie + status */}
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-white font-semibold text-lg leading-tight">
              {booking.movieTitle}
            </h3>
            <StatusBadge status={booking.status} />
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Detail icon="🏛️" label={booking.theatreName} />
            <Detail icon="🎭" label={booking.screenName} />
            <Detail icon="📅" label={formatDate(booking.showDate)} />
            <Detail icon="⏰" label={formatTime(booking.showTime)} />
           <Detail
  icon="💺"
  label={booking.seatNumbers?.join(', ')}
/>
<Detail icon="💰" label={`₹${booking.totalAmount}`} />
          </div>

          {/* Food order if any */}
          {booking.foodItems?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-zinc-500 text-xs mb-1">🍿 Food order</p>
              <p className="text-zinc-400 text-sm">
                {booking.foodItems.map((f) => `${f.name} ×${f.quantity}`).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Cancel button */}
        {showCancel && booking.status === 'CONFIRMED' && (
          <button
            onClick={() => onCancel(booking.id)}
            disabled={isCancelling}
            className="flex-shrink-0 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel'}
          </button>
        )}
      </div>

      {/* Booking ID */}
      <p className="text-zinc-700 text-xs mt-4">Booking #{booking.id}</p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    CONFIRMED: 'bg-green-500/10 text-green-400 border-green-500/20',
    COMPLETED: 'bg-zinc-700/50 text-zinc-400 border-zinc-600',
    CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
    HELD:      'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[status] ?? styles.COMPLETED}`}>
      {status}
    </span>
  );
}

function Detail({ icon, label }) {
  if (!label) return null;
  return (
    <div className="flex items-center gap-1.5 text-zinc-400">
      <span className="text-xs">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(+h, +m);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}