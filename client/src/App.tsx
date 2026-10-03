import { Route, Routes } from "react-router-dom";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <Routes>
      {/* Public pages: anyone can open these */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Everything inside this group needs a login.
          Later pages (properties, leases...) go in here too. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  );
}