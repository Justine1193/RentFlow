import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "./AuthContext";
import logoOnlyImg from "../../assets/logo only.png";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm(): boolean {
    const errors: FieldErrors = {};

    if (!name.trim()) {
      errors.name = "Please fill out this field.";
    }

    if (!email.trim()) {
      errors.email = "Please fill out this field.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Please fill out this field.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Unable to create the account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between items-center px-4 py-8 sm:py-12 selection:bg-[#010736] selection:text-white">
      <div className="my-auto w-full max-w-md animate-fade-in-up">
        {/* Brand Logo & Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex justify-center mb-2.5">
            <img
              src={logoOnlyImg}
              alt="RentFlow Logo"
              className="h-14 sm:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105 drop-shadow-xs"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#010736]">
            Create Landlord Account
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
            Start organizing your rental units and tenants with RentFlow
          </p>
        </div>

        {/* Main Card (Clean White Surface) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs transition-all duration-200 hover:shadow-md">
          {/* Server / API Error Alert */}
          {serverError && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs sm:text-sm text-red-700 animate-fade-in-up">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-red-500" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold uppercase tracking-wider text-[#010736]"
              >
                Full name
              </label>
              <div className="relative mt-1.5">
                <div
                  className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 ${
                    fieldErrors.name ? "text-red-500" : "text-slate-400"
                  }`}
                >
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Maria Santos"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) {
                      setFieldErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-base sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                    fieldErrors.name
                      ? "border-red-400 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20"
                      : "border-slate-300 text-[#010736] placeholder:text-slate-400 focus:border-[#010736] focus:ring-[#010736]/15"
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 animate-fade-in-up">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span>{fieldErrors.name}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#010736]"
              >
                Email address
              </label>
              <div className="relative mt-1.5">
                <div
                  className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 ${
                    fieldErrors.email ? "text-red-500" : "text-slate-400"
                  }`}
                >
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-base sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? "border-red-400 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20"
                      : "border-slate-300 text-[#010736] placeholder:text-slate-400 focus:border-[#010736] focus:ring-[#010736]/15"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 animate-fade-in-up">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span>{fieldErrors.email}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#010736]"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <div
                  className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 ${
                    fieldErrors.password ? "text-red-500" : "text-slate-400"
                  }`}
                >
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-10 text-base sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                    fieldErrors.password
                      ? "border-red-400 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20"
                      : "border-slate-300 text-[#010736] placeholder:text-slate-400 focus:border-[#010736] focus:ring-[#010736]/15"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-[#010736] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 animate-fade-in-up">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span>{fieldErrors.password}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#010736] py-2.5 px-4 text-sm font-semibold text-white shadow-xs hover:bg-[#0D1C42] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#010736]/20 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-150"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create account</span>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#010736] hover:underline underline-offset-2 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Auth Footer */}
      <footer className="w-full text-center py-4 text-xs text-slate-400">
        © {new Date().getFullYear()} RentFlow. All rights reserved.
      </footer>
    </div>
  );
}