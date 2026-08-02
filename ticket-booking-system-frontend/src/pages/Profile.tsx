import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface ProfileFormState {
  name: string;
  email: string;
  phone: string;
  role: string;
}

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState<ProfileFormState>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "CUSTOMER"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/auth/me");
        const currentUser = response.data?.user || user;

        const nextForm = {
          name: currentUser?.name || "",
          email: currentUser?.email || "",
          phone: currentUser?.phone || "",
          role: currentUser?.role || "CUSTOMER"
        };

        setFormData(nextForm);
        updateProfile(nextForm);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, updateProfile]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      setSaving(true);
      updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      });
      setSuccessMessage("Profile updated for this session.");
      setIsEditing(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
          <p className="mt-2 text-slate-600">Manage your account details from one clean, responsive view.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing((current) => !current)}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {loading && <div className="text-slate-600">Loading profile...</div>}
      {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {successMessage && <div className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-600">{successMessage}</div>}

      {!loading && (
        <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-700">Name</span>
            <input
              type="text"
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              disabled={!isEditing}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">Email</span>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              disabled={!isEditing}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">Phone</span>
            <input
              type="tel"
              value={formData.phone}
              onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
              disabled={!isEditing}
              placeholder="Add a phone number"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">Role</span>
            <input
              type="text"
              value={formData.role}
              disabled
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700 outline-none"
            />
          </label>

          {isEditing && (
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      )}
    </section>
  );
};

export default ProfilePage;
