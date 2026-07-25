"use client";

import { useEffect, useState } from "react";
import { AdminApi } from "@/lib/api";
import { decodeAdminEmail, getAdminToken } from "@/lib/adminAuth";

export function useAdminApi() {
  const [api, setApi] = useState<AdminApi | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // document.cookie is only readable client-side — deferred to an effect so the
    // server-rendered pass and first client render both start from `null`, avoiding
    // a hydration mismatch.
    const token = getAdminToken();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApi(token ? new AdminApi({ token }) : null);
    setEmail(token ? decodeAdminEmail(token) : null);
  }, []);

  return { api, email };
}
