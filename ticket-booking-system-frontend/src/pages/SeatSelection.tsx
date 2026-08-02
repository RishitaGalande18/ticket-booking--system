import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

interface SeatItem {
  showSeatId: string;
  row: string;
  seat: number;
  category: string;
  color: string;
  price: number | null;
  status: string;
}

const statusStyles: Record<string, string> = {
  AVAILABLE: "bg-emerald-500 text-white hover:bg-emerald-600",
  HELD: "bg-amber-400 text-slate-900 cursor-not-allowed opacity-70",
  BOOKED: "bg-rose-500 text-white cursor-not-allowed opacity-70"
};

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/shows/${showId}/seats`);
        setSeats(response.data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (showId) {
      fetchSeats();
    }
  }, [showId]);

  const groupedSeats = useMemo(() => {
    return seats.reduce<Record<string, SeatItem[]>>((acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }

      acc[seat.row].push(seat);
      return acc;
    }, {});
  }, [seats]);

  const selectedSeats = useMemo(() => {
    return seats.filter((seat) => selectedIds.includes(seat.showSeatId));
  }, [seats, selectedIds]);

  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
  }, [selectedSeats]);

  const toggleSeat = (showSeatId: string, status: string) => {
    if (status !== "AVAILABLE") {
      return;
    }

    setSelectedIds((current) =>
      current.includes(showSeatId)
        ? current.filter((id) => id !== showSeatId)
        : [...current, showSeatId]
    );
  };

  const handleContinue = async () => {
    if (!showId || selectedIds.length === 0) {
      setBookingError("Please select at least one seat.");
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);
      setSuccessMessage(null);

      await api.post("/shows/holds", {
        showId,
        seatIds: selectedIds
      });

      const response = await api.post("/bookings/confirm", {
        showId,
        seatIds: selectedIds
      });

      const booking = response.data?.booking;

      if (booking?.id) {
        setSuccessMessage("Booking confirmed. Redirecting to your booking details...");
        navigate(`/bookings/${booking.id}`);
      } else {
        setBookingError("Booking could not be created. Please try again.");
      }
    } catch (err) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setBookingError(errorMessage || "Unable to complete booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Seat Selection</h1>
            <p className="text-sm text-slate-600">Choose your seats and continue to booking.</p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Available</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">Held</span>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">Booked</span>
          </div>
        </div>
      </div>

      {loading && <div className="text-slate-600">Loading seat layout...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 rounded-2xl bg-slate-100 p-3 text-center text-sm font-semibold text-slate-700">
              Screen
            </div>

            <div className="space-y-4">
              {Object.entries(groupedSeats).map(([row, rowSeats]) => (
                <div key={row} className="flex items-center gap-2">
                  <div className="w-8 text-sm font-medium text-slate-500">{row}</div>
                  <div className="flex flex-wrap gap-2">
                    {rowSeats.map((seat) => (
                      <button
                        key={seat.showSeatId}
                        type="button"
                        onClick={() => toggleSeat(seat.showSeatId, seat.status)}
                        disabled={seat.status !== "AVAILABLE"}
                        className={`flex h-12 w-12 items-center justify-center rounded-xl text-xs font-semibold transition ${statusStyles[seat.status] || "bg-slate-200 text-slate-700"}`}
                      >
                        {seat.seat}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Selected Seats</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              {selectedSeats.length === 0 ? (
                <p>No seats selected.</p>
              ) : (
                selectedSeats.map((seat) => (
                  <div key={seat.showSeatId} className="rounded-xl bg-slate-50 p-3">
                    <p className="font-medium text-slate-900">{seat.row}{seat.seat}</p>
                    <p>{seat.category}</p>
                    <p>{seat.price ? `₹${seat.price}` : "Price unavailable"}</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Amount</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">₹{totalAmount}</p>
            </div>

            {bookingError && <p className="mt-4 text-sm text-red-600">{bookingError}</p>}
            {successMessage && <p className="mt-4 text-sm text-emerald-600">{successMessage}</p>}

            <button
              type="button"
              onClick={handleContinue}
              disabled={bookingLoading || selectedIds.length === 0}
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bookingLoading ? "Processing..." : "Continue"}
            </button>
          </aside>
        </div>
      )}
    </section>
  );
};

export default SeatSelectionPage;
