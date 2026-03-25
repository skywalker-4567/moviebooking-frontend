import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovie, getReviews, submitReview } from '../api/movies';
import { getShowsByMovie } from '../api/shows';
import { useAuth } from '../context/AuthContext';

export default function MovieDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('shows'); // 'shows' | 'reviews'

  useEffect(() => {
    fetchAll();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [movieRes, showsRes, reviewsRes] = await Promise.all([
  getMovie(id),
  getShowsByMovie(Number(id)),
  getReviews(id),
]);
setMovie(movieRes.data);
setShows(Array.isArray(showsRes.data) ? showsRes.data : showsRes.data.content ?? []);
setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : reviewsRes.data.content ?? []);
const dates = getUniqueDates(Array.isArray(showsRes.data) ? showsRes.data : showsRes.data.content ?? []);
if (dates.length > 0) setSelectedDate(dates[0]);
    } catch {
      // handle silently — movie not found case
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  try {
    await submitReview({ movieId: Number(id), ...reviewForm });
    const res = await getReviews(id);
    setReviews(Array.isArray(res.data) ? res.data : res.data.content ?? []);
    setReviewForm({ rating: 5, comment: '' });
  } finally {
    setSubmitting(false);
  }
};

  // Group shows by date
 // groupByRow date extraction
const getUniqueDates = (shows) =>
  [...new Set(shows.map((s) => s.startTime?.split('T')[0]))].sort();

const showsForDate = shows.filter(
  (s) => s.startTime?.split('T')[0] === selectedDate
);

  if (loading) return <PageSkeleton />;
  if (!movie) return <div className="text-center text-zinc-500 py-20">Movie not found</div>;

  const dates = getUniqueDates(shows);
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Hero Banner */}
      <div className="relative">
        {/* Backdrop blur bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 to-zinc-950" />
        {movie.posterUrl && (
          <div
            className="absolute inset-0 bg-center bg-cover opacity-10"
            style={{ backgroundImage: `url(${movie.posterUrl})` }}
          />
        )}

        <div className="relative max-w-5xl mx-auto px-6 py-12 flex gap-8">
          {/* Poster */}
          <div className="hidden sm:block flex-shrink-0 w-44 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800">
            {movie.posterUrl
              ? <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-5xl">🎬</div>
            }
          </div>

          {/* Info */}
          <div className="flex flex-col justify-end">
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genre && <Badge>{movie.genre}</Badge>}
              {movie.language && <Badge>{movie.language}</Badge>}
              {movie.certification && <Badge>{movie.certification}</Badge>}
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{movie.title}</h1>
            <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
              {movie.durationMinutes && <span>⏱ {movie.durationMinutes} min</span>}
              {movie.releaseDate && <span>📅 {movie.releaseDate}</span>}
              {avgRating && (
                <span className="text-amber-400 font-semibold">★ {avgRating} ({reviews.length} reviews)</span>
              )}
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">{movie.description}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex border-b border-zinc-800 mb-8">
          {['shows', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tab === 'shows' ? `Showtimes (${shows.length})` : `Reviews (${reviews.length})`}
            </button>
          ))}
        </div>

        {/* ── SHOWS TAB ── */}
        {activeTab === 'shows' && (
          <div className="pb-16">
            {dates.length === 0 ? (
              <p className="text-zinc-500 text-center py-12">No shows available currently.</p>
            ) : (
              <>
                {/* Date Selector */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
                  {dates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDate === date
                          ? 'bg-amber-500 text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>

                {/* Shows for selected date */}
                <div className="space-y-4">
                  {showsForDate.map((show) => (
  <ShowRow
    key={show.id ?? show.showId}
    show={show}
    onBook={() => navigate(`/shows/${show.showId}/seats`, {
  state: { show: { ...show, showId: show.showId } }
})}
  />
))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── REVIEWS TAB ── */}
        {activeTab === 'reviews' && (
          <div className="pb-16 space-y-6">
            {/* Submit review — only for logged-in customers */}
            {user?.role === 'CUSTOMER' && (
              <form
                onSubmit={handleReviewSubmit}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
              >
                <h3 className="text-white font-semibold mb-4">Write a Review</h3>
                <div className="flex items-center gap-3 mb-4">
                  <label className="text-zinc-400 text-sm">Rating:</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`text-2xl transition-colors ${
                          star <= reviewForm.rating ? 'text-amber-400' : 'text-zinc-700'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="What did you think?"
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 resize-none mb-3"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold px-5 py-2 rounded-lg text-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="text-zinc-500 text-center py-12">No reviews yet. Be the first!</p>
            ) : (
              reviews.map((review) => (
  <div key={review.reviewId} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-white font-medium text-sm">{review.userName || 'Anonymous'}</span>
      <span className="text-amber-400 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
    </div>
    <p className="text-zinc-400 text-sm">{review.comment}</p>
    {review.reviewedAt && (
      <p className="text-zinc-600 text-xs mt-2">
        {new Date(review.reviewedAt).toLocaleDateString()}
      </p>
    )}
  </div>
))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Show Row ──────────────────────────────────────────────────
function ShowRow({ show, onBook }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-white font-medium">{show.theatreName}</p>
        <p className="text-zinc-500 text-sm mt-0.5">{show.screenName}</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-white font-semibold">{formatDateTime(show.startTime)}</p>
          <p className="text-zinc-500 text-xs">Showtime</p>
        </div>
        <div className="text-center">
          <p className="text-amber-400 font-semibold">₹{show.basePrice}</p>
          <p className="text-zinc-500 text-xs">per seat</p>
        </div>
        <button
          onClick={onBook}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-2 rounded-lg text-sm"
        >
          Book
        </button>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────
function Badge({ children }) {
  return (
    <span className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-full">{children}</span>
  );
}

function formatDateTime(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 animate-pulse">
      <div className="bg-zinc-900 h-64" />
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="bg-zinc-800 h-20 rounded-xl" />)}
      </div>
    </div>
  );
}