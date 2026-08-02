import { Link } from "react-router-dom";

interface EventCardProps {
  id: string;
  title: string;
  category: string;
  venue?: string;
  date?: string;
  time?: string;
}

const EventCard = ({ id, title, category, venue, date, time }: EventCardProps) => {
  return (
    <Link
      to={`/events/${id}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="h-48 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 p-6 text-white">
        <div className="flex h-full items-end">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            {category}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <div className="space-y-1 text-sm text-slate-600">
          <p>Venue: {venue || "Venue TBD"}</p>
          <p>Date: {date || "Date TBD"}</p>
          <p>Time: {time || "Time TBD"}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
