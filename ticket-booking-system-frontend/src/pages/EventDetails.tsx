import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

interface EventDetailPayload {
  event: {
    id: string;
    title: string;
    description?: string | null;
    poster_url?: string | null;
    event_type?: string | null;
    duration_minutes?: number | null;
  };
  shows: Array<{
    id: string;
    venue_id?: string | number | null;
    start_time?: string | null;
    end_time?: string | null;
    status?: string | null;
  }>;
}

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "TBD";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState<EventDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/events/${eventId}`);
        setEventData(response.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const firstShow = useMemo(() => eventData?.shows?.[0], [eventData]);

  if (loading) {
    return <div className="text-slate-600">Loading event details...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (!eventData?.event) {
    return <div className="text-slate-600">Event not found.</div>;
  }

  const { event } = eventData;

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-72 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 p-8 text-white">
          {event.poster_url ? (
            <img
              src={event.poster_url}
              alt={event.title}
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-full items-end">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                {event.event_type || "Event"}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6 p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900">{event.title}</h1>
            <p className="text-slate-600">{event.description || "No description available."}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Venue</p>
              <p className="mt-2 text-base font-medium text-slate-900">
                {firstShow?.venue_id ? `Venue ${firstShow.venue_id}` : "Venue TBD"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Date</p>
              <p className="mt-2 text-base font-medium text-slate-900">
                {firstShow ? new Date(firstShow.start_time || "").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Date TBD"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Time</p>
              <p className="mt-2 text-base font-medium text-slate-900">
                {firstShow ? new Date(firstShow.start_time || "").toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }) : "Time TBD"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Available Seats</p>
              <p className="mt-2 text-base font-medium text-slate-900">Seat categories coming soon</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Pricing</p>
            <p className="mt-2 text-base font-medium text-slate-900">Pricing details coming soon</p>
          </div>

          <Link
            to={firstShow ? `/shows/${firstShow.id}/seats` : "/login"}
            className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700"
          >
            Book Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EventDetailsPage;
