import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

interface BookingDetail {
  bookingReference: string;
  amount: number;
  status?: string;
  qrCodeUrl?: string;
  verificationUrl?: string;
  seats: string[];
}

const BookingDetailsPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/bookings/${bookingId}`);
        const detailData = response.data?.data || null;

        if (detailData?.bookingReference) {
          const statusResponse = await api.get(`/bookings/verify/${detailData.bookingReference}`);
          const statusData = statusResponse.data?.data || null;

          setBooking({
            ...detailData,
            status: statusData?.status || "CONFIRMED"
          });
          return;
        }

        setBooking(detailData);
      } catch (err) {
        const fallbackReference = bookingId;
        if (fallbackReference) {
          try {
            const statusResponse = await api.get(`/bookings/verify/${fallbackReference}`);
            const statusData = statusResponse.data?.data || null;

            setBooking({
              bookingReference: statusData?.bookingReference || fallbackReference,
              amount: statusData?.amount || 0,
              status: statusData?.status || "CONFIRMED",
              seats: statusData?.seats || []
            });
            return;
          } catch {
            // fall through to display error below
          }
        }

        const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(errorMessage || "Unable to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  if (loading) {
    return <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">Loading booking details...</section>;
  }

  if (error) {
    return <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><p className="text-red-600">{error}</p></section>;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-2xl">
        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative p-7">
            <div className="absolute right-0 top-1/2 h-10 w-10 -translate-y-1/2 translate-x-1/2 rounded-full bg-white"></div>
            <div className="absolute left-0 top-1/2 h-10 w-10 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white"></div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Digital Ticket</p>
                <h1 className="mt-2 text-2xl font-semibold">Booking Details</h1>
              </div>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                {booking?.status || "CONFIRMED"}
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-300">Booking Reference</p>
                <p className="mt-2 text-lg font-semibold">{booking?.bookingReference}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-300">Amount</p>
                <p className="mt-2 text-lg font-semibold">₹{booking?.amount}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-slate-300">Seats</p>
              <p className="mt-2 text-base font-medium">{booking?.seats?.join(", ") || "—"}</p>
            </div>

            {booking?.verificationUrl && (
              <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm text-slate-200 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-300">Verification URL</p>
                <a href={booking.verificationUrl} className="mt-2 block break-all text-sky-300 underline" target="_blank" rel="noreferrer">
                  {booking.verificationUrl}
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-4 border-t border-white/10 bg-white/5 p-7 md:border-l md:border-t-0">
            {booking?.qrCodeUrl ? (
              <div className="rounded-2xl bg-white p-4 text-slate-900">
                <p className="text-xs uppercase tracking-wide text-slate-500">Scan to Verify</p>
                <img src={booking.qrCodeUrl} alt="Booking QR Code" className="mt-3 h-56 w-56 rounded-xl border border-slate-200 bg-white p-3" />
              </div>
            ) : (
              <div className="rounded-2xl bg-white/10 p-4 text-sm text-slate-200">
                Ticket QR code is unavailable for this booking.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingDetailsPage;
