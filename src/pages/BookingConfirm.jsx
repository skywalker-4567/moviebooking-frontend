import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmBooking } from '../api/bookings';
import { getFoodMenu, placeFoodOrder } from '../api/food';

const HOLD_DURATION = 10 * 60;

export default function BookingConfirm() {
  const navigate = useNavigate();
  const [holdData, setHoldData] = useState(null);
  const [foodMenu, setFoodMenu] = useState([]);
  const [foodOrder, setFoodOrder] = useState({}); // { itemId: quantity }
  const [timeLeft, setTimeLeft] = useState(HOLD_DURATION);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('holdData');
    if (!raw) { navigate('/'); return; }
    const data = JSON.parse(raw);
    setHoldData(data);
    fetchFood(data.show?.theatreId);
  }, []);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      sessionStorage.removeItem('holdData');
      alert('Hold expired! Please book again.');
      navigate('/');
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const fetchFood = async (theatreId) => {
    if (!theatreId) return;
    try {
      const res = await getFoodMenu(theatreId);
      setFoodMenu(res.data);
    } catch {
      // food menu optional — fail silently
    }
  };

  const updateFood = (itemId, delta) => {
    setFoodOrder((prev) => {
      const qty = (prev[itemId] || 0) + delta;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: qty };
    });
  };

  const handleConfirm = async () => {
  setConfirming(true);
  setError('');
  try {
    // Step 1 — confirm booking
    await confirmBooking({
  showId: Number(holdData.showId),
  showSeatIds: holdData.seatIds,
});
    const confirmedBookingId = res.data.bookingId ?? holdData.bookingId;

    // Step 2 — place food order separately if any
    const foodItems = Object.entries(foodOrder).map(([itemId, quantity]) => ({
  foodItemId: Number(itemId),  // ← was itemId
  quantity,
}));

    if (foodItems.length > 0) {
      await placeFoodOrder({
        bookingId: confirmedBookingId,
        items: foodItems,
      });
    }

    sessionStorage.removeItem('holdData');
    navigate('/my-bookings', { state: { justBooked: true } });
  } catch (err) {
    setError(err.response?.data?.message || 'Confirmation failed. Try again.');
  } finally {
    setConfirming(false);
  }
};

  if (!holdData) return null;

  const { show, seats } = holdData;
  const ticketTotal = seats.reduce((sum, s) => sum + (s.price ?? show?.price ?? 0), 0);
  const foodTotal = foodMenu.reduce((sum, item) => {
    return sum + (foodOrder[item.id] || 0) * item.price;
  }, 0);
  const grandTotal = ticketTotal + foodTotal;

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const timerUrgent = timeLeft < 120; // red under 2 min

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-32">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="max-w-2xl w-full mx-auto flex items-center justify-between">
          <h1 className="text-white font-bold text-lg">Confirm Booking</h1>
          {/* Countdown Timer */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-mono font-bold ${
            timerUrgent
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            ⏱ {mins}:{secs}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-8 space-y-6">

        {/* Show Summary */}
        <Section title="Show Details">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Movie" value={show?.movieTitle} />
            <Info label="Theatre" value={show?.theatreName} />
            <Info label="Screen" value={show?.screenName} />
            <Info label="Date" value={show?.showDate} />
            <Info label="Time" value={formatTime(show?.showTime)} />
            <Info label="Format" value={show?.format || 'Standard'} />
          </div>
        </Section>

        {/* Seats */}
        <Section title="Selected Seats">
          <div className="flex flex-wrap gap-2">
            {seats.map((seat) => (
              <div
                key={seat.id}
                className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg text-sm"
              >
                <span className="text-white font-medium">
                  {seat.rowLabel}{seat.seatNumber}
                </span>
                {seat.type && seat.type !== 'REGULAR' && (
                  <span className="text-zinc-500 ml-1.5 text-xs">{seat.type}</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm mt-4 pt-4 border-t border-zinc-800">
            <span className="text-zinc-400">{seats.length} × ticket</span>
            <span className="text-white font-semibold">₹{ticketTotal}</span>
          </div>
        </Section>

        {/* Food Add-ons */}
        {foodMenu.length > 0 && (
          <Section title="🍿 Add Food & Drinks">
            <p className="text-zinc-500 text-xs mb-4">Optional — add to your order</p>
            <div className="space-y-3">
              {foodMenu.map((item) => (
                <FoodItem
                  key={item.id}
                  item={item}
                  qty={foodOrder[item.id] || 0}
                  onAdd={() => updateFood(item.id, 1)}
                  onRemove={() => updateFood(item.id, -1)}
                />
              ))}
            </div>
            {foodTotal > 0 && (
              <div className="flex justify-between text-sm mt-4 pt-4 border-t border-zinc-800">
                <span className="text-zinc-400">Food total</span>
                <span className="text-white font-semibold">₹{foodTotal}</span>
              </div>
            )}
          </Section>
        )}

        {/* Price Breakdown */}
        <Section title="Price Breakdown">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Tickets ({seats.length})</span>
              <span className="text-white">₹{ticketTotal}</span>
            </div>
            {foodTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Food & drinks</span>
                <span className="text-white">₹{foodTotal}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-zinc-800 font-bold text-base">
              <span className="text-white">Total</span>
              <span className="text-amber-400">₹{grandTotal}</span>
            </div>
          </div>
        </Section>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Sticky Confirm Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-lg">₹{grandTotal}</p>
            <p className="text-zinc-500 text-xs">Total payable</p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold px-10 py-3 rounded-xl"
          >
            {confirming ? 'Confirming...' : 'Confirm & Pay →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Food Item ─────────────────────────────────────────────────
function FoodItem({ item, qty, onAdd, onRemove }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white text-sm font-medium">{item.name}</p>
        <p className="text-zinc-500 text-xs">₹{item.price}</p>
      </div>
      <div className="flex items-center gap-3">
        {qty > 0 ? (
          <>
            <button
              onClick={onRemove}
              className="w-7 h-7 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-sm flex items-center justify-center"
            >
              −
            </button>
            <span className="text-white text-sm w-4 text-center">{qty}</span>
            <button
              onClick={onAdd}
              className="w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center justify-center"
            >
              +
            </button>
          </>
        ) : (
          <button
            onClick={onAdd}
            className="text-amber-400 hover:text-amber-300 text-sm font-medium px-3 py-1 border border-amber-500/30 rounded-lg"
          >
            + Add
          </button>
        )}
      </div>
    </div>
  );
}

// ── Reusable UI ───────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="text-white font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-zinc-500 text-xs mb-0.5">{label}</p>
      <p className="text-white">{value || '—'}</p>
    </div>
  );
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(+h, +m);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}