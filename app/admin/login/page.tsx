"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (authErr) {
      setError(authErr.message);
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold mb-1 text-slate-900">Admin sign in</h1>
        <p className="text-sm text-slate-500 mb-6">
          Aromavitae landing-page admin portal.
        </p>

        <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-forest"
          autoComplete="email"
        />

        <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-forest"
          autoComplete="current-password"
        />

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-forest text-white text-sm font-medium hover:bg-forest-light transition disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
