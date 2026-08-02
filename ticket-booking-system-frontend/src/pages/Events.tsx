import { useEffect, useMemo, useState } from "react";
import EventCard from "../components/EventCard";
import api from "../services/api";

interface EventItem {
  id: string;
  title: string;
  event_type?: string;
}

const EventsPage = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get("/events");
        setEvents(response.data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) =>
      event.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [events, search]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Events</h1>
            <p className="text-sm text-slate-600">Browse available shows and book your seats.</p>
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search events"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 md:max-w-sm"
          />
        </div>
      </div>

      {loading && <p className="text-slate-600">Loading events...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              id={String(event.id)}
              title={event.title}
              category={event.event_type || "General"}
            />
          ))}
        </div>
      )}

      {!loading && !error && filteredEvents.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No events found.
        </div>
      )}
    </section>
  );
};

export default EventsPage;
