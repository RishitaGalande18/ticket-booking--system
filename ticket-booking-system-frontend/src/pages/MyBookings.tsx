import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface BookingSummary {
  bookingReference: string;
  showTitle: string;
  totalAmount: number;
  status: string;
}

const PAGE_SIZE = 5;

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/bookings/my");
        setBookings(response.data?.data || []);
      } catch (err) {
        const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(errorMessage || "Unable to load your bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE));

  const paginatedBookings = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return bookings.slice(start, start + PAGE_SIZE);
  }, [bookings, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Bookings</h1>
          <p className="mt-2 text-slate-600">View your confirmed bookings and ticket details.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
          {bookings.length} total booking{bookings.length === 1 ? "" : "s"}
        </div>
      </div>

      {loading && <div className="mt-6 text-slate-600">Loading your bookings...</div>}
      {error && <div className="mt-6 text-sm text-red-600">{error}</div>}

      {!loading && !error && bookings.length === 0 && (
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-slate-600">No bookings found yet.</div>
      )}

      {!loading && !error && paginatedBookings.length > 0 && (
        <div className="mt-6 space-y-4">
          {paginatedBookings.map((booking) => (
            <div key={booking.bookingReference} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Booking Reference</p>
                  <p className="text-lg font-semibold text-slate-900">{booking.bookingReference}</p>
                  <p className="text-sm text-slate-700">{booking.showTitle}</p>
                </div>

                <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2 md:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Amount</p>
                    <p className="font-semibold text-slate-900">₹{booking.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                    <p className="font-semibold text-slate-900">{booking.status}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/bookings/${booking.bookingReference}`)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-sm text-slate-600">Page {page} of {totalPages}</p>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default MyBookingsPage;
