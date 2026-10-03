import { useAuth } from "../features/auth/AuthContext";

// Temporary page. We'll replace it with the real dashboard later.
export default function HomePage() {
    const { user, logout } = useAuth();

    return (
        <main className="mx-auto mt-16 max-w-xl px-4">
            {/* user?.name: the ? avoids a crash if user is null */}
            <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>
            <p className="mt-1 text-sm text-gray-600">Signed in as {user?.role.toLowerCase()}.</p>
            <button onClick={logout} className="mt-4 rounded border border-gray-300 px-3 py-2 text-sm">
                Log out
            </button>
        </main>
    );
}