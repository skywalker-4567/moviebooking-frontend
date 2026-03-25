import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovies } from '../api/movies';

const GENRES = ['All', 'Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Thriller'];

export default function Landing() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, [page]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await getMovies(page);
      // Spring Boot paginated response shape:
      // { content: [...], totalPages: N, totalElements: N }
      setMovies(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      setError('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const filtered = movies.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genre === 'All' || m.genre === genre;
    return matchSearch && matchGenre;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Hero */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-3 tracking-tight">
          What are you <span className="text-amber-400">watching</span> tonight?
        </h1>
        <p className="text-zinc-400 mb-8 text-lg">Book tickets for the latest movies near you</p>
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-zinc-800 border border-zinc-700 text-white rounded-xl px-5 py-3 focus:outline-none focus:border-amber-500 text-sm"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">

        {/* Genre Filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                genre === g
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* States */}
        {error && <p className="text-red-400 text-center py-12">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-zinc-800 rounded-xl aspect-[2/3] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">No movies found</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filtered.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => navigate(`/movies/${movie.id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-zinc-800 rounded-lg text-sm disabled:opacity-30 hover:bg-zinc-700"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 text-zinc-400 text-sm">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-4 py-2 bg-zinc-800 rounded-lg text-sm disabled:opacity-30 hover:bg-zinc-700"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Movie Card ────────────────────────────────────────────────
function MovieCard({ movie, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 mb-2">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-4xl">
            🎬
          </div>
        )}
        {/* Rating badge */}
        {movie.rating && (
          <div className="absolute top-2 right-2 bg-black/70 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-md">
            ★ {movie.rating}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Info */}
      <p className="text-white text-sm font-medium leading-tight truncate">{movie.title}</p>
      <p className="text-zinc-500 text-xs mt-0.5">{movie.genre} · {movie.durationMinutes}m</p>
    </div>
  );
}