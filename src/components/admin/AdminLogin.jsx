import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";

function looksLikeEmail(value) {
  return String(value).includes("@");
}

function AdminLogin({
  loginForm,
  setLoginForm,
  loginError,
  onSubmit,
  loading = false,
  checkingSession = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const next = {};
    const identifier = loginForm.identifier.trim();
    const password = loginForm.password;

    if (!identifier) {
      next.identifier = "Email or phone number is required";
    } else if (looksLikeEmail(identifier)) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        next.identifier = "Enter a valid email address";
      }
    } else {
      const digits = identifier.replace(/\D/g, "");
      if (digits.length < 10) {
        next.identifier = "Enter a valid 10-digit phone number";
      }
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading || checkingSession) return;
    if (!validate()) return;
    onSubmit(e);
  };

  const IdentifierIcon = looksLikeEmail(loginForm.identifier) ? Mail : Phone;

  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col">
      <Navbar />

      <main className="relative flex-1 flex items-center justify-center px-6 py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[min(36rem,90vw)] h-[22rem] bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[18rem] h-[18rem] bg-accent-warm/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-center">
          <div className="hidden lg:block">
            <p className="theme-label mb-4">ADMIN ACCESS</p>
            <h1 className="theme-heading text-4xl xl:text-5xl mb-5">
              Secure Dashboard Login
            </h1>
            <p className="text-muted text-base xl:text-lg leading-relaxed max-w-md">
              Sign in with your authorized email or phone number to manage
              applications, programs, certificates, and payments.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-subtle">
              <li className="flex items-center gap-2">
                <Shield size={15} className="text-accent shrink-0" />
                Protected admin-only area
              </li>
              <li className="flex items-center gap-2">
                <Lock size={15} className="text-accent shrink-0" />
                Session-based access after login
              </li>
            </ul>

            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-10 text-sm text-muted hover:text-accent transition"
            >
              <ArrowLeft size={15} />
              Back to website
            </Link>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="lg:hidden text-center mb-6">
              <p className="theme-label mb-2">ADMIN ACCESS</p>
              <h1 className="text-2xl font-semibold text-fg">Admin Login</h1>
            </div>

            <div className="theme-card relative overflow-hidden p-7 md:p-8 rounded-3xl border border-border/80 shadow-2xl">
              <div
                className="pointer-events-none absolute -top-16 -right-10 w-40 h-40 rounded-full bg-accent/10 blur-2xl"
                aria-hidden="true"
              />

              <div className="relative flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Lock className="text-accent" size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-medium text-fg">Admin Login</h2>
                  <p className="text-subtle text-sm">
                    Email or phone + password
                  </p>
                </div>
              </div>

              {checkingSession ? (
                <div className="relative flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="animate-spin text-accent" size={28} />
                  <p className="text-muted text-sm">Checking your session...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="admin-identifier"
                      className="block text-sm text-muted mb-2"
                    >
                      Email or phone
                    </label>
                    <div className="relative">
                      <IdentifierIcon
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
                      />
                      <input
                        id="admin-identifier"
                        type="text"
                        name="identifier"
                        value={loginForm.identifier}
                        onChange={handleChange}
                        placeholder="Enter your Email or phone"
                        autoComplete="username"
                        autoFocus
                        disabled={loading}
                        className={`w-full bg-input border rounded-xl py-3.5 pl-11 pr-4 text-fg placeholder-subtle focus:border-accent/50 focus:outline-none transition disabled:opacity-60 ${
                          fieldErrors.identifier
                            ? "border-red-500/50"
                            : "border-border"
                        }`}
                      />
                    </div>
                    {fieldErrors.identifier ? (
                      <p className="mt-1.5 text-xs text-red-400">
                        {fieldErrors.identifier}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="admin-password"
                      className="block text-sm text-muted mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
                      />
                      <input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={loginForm.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={loading}
                        className={`w-full bg-input border rounded-xl py-3.5 pl-11 pr-12 text-fg placeholder-subtle focus:border-accent/50 focus:outline-none transition disabled:opacity-60 ${
                          fieldErrors.password
                            ? "border-red-500/50"
                            : "border-border"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-subtle hover:text-fg transition"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {fieldErrors.password ? (
                      <p className="mt-1.5 text-xs text-red-400">
                        {fieldErrors.password}
                      </p>
                    ) : null}
                  </div>

                  {loginError ? (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 px-3">
                      {loginError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full theme-btn-primary py-4 font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Shield size={18} />
                        Access Dashboard
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="relative mt-6 text-center text-xs text-subtle lg:hidden">
                <Link to="/" className="hover:text-accent transition">
                  ← Back to website
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminLogin;
