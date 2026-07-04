"use client";

import { useEffect, useState } from "react";
import { AdminApi } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function useAdminApi() {
  const [api, setApi] = useState<AdminApi | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const sync = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const token = data.session?.access_token;
      setEmail(data.session?.user?.email ?? null);
      setApi(token ? new AdminApi({ token }) : null);
    };

    sync();
    const { data: sub } = supabase.auth.onAuthStateChange(() => sync());

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { api, email };
}
