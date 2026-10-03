import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Same pattern as the login page, with one extra field (name)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await register(name, email, password); // creates the account and logs in
      navigate("/");
    } catch (err) {
      // e.g. "An account with this email already exists."
      setError(err instanceof Error ? err.message : "Unable to create the account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto mt-16 max-w-sm px-4">
      <h1 className="text-xl font-semibold">Create a landlord account</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Full name</label>
          <input id="name" required value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input id="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          {/* minLength gives instant browser feedback; the server checks it again */}
          <input id="password" type="password" required minLength={8} value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
          <p className="mt-1 text-xs text-gray-500">At least 8 characters.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={isSubmitting}
          className="w-full rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50">
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Already registered? <Link to="/login" className="text-blue-600 underline">Log in</Link>
      </p>
    </main>
  );
}