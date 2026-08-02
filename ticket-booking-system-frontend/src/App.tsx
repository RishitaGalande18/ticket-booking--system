import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import EventsPage from "./pages/Events";
import EventDetailsPage from "./pages/EventDetails";
import SeatSelectionPage from "./pages/SeatSelection";
import MyBookingsPage from "./pages/MyBookings";
import BookingDetailsPage from "./pages/BookingDetails";
import ProfilePage from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:eventId" element={<EventDetailsPage />} />
        <Route path="shows/:showId/seats" element={<SeatSelectionPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="bookings/:bookingId" element={<BookingDetailsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
