"use client";

import { useState } from "react";
import { Button, toast } from "@payloadcms/ui";

/** Lets staff check the mail server works, without placing an order. */
export function SendTestEmail() {
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/shop/email-test", { method: "POST" });
      const body = (await res.json()) as { message?: string };
      if (res.ok) toast.success(body.message ?? "Sent.");
      else toast.error(body.message ?? "That didn't work.");
    } catch {
      toast.error("Couldn't reach the server.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Button buttonStyle="secondary" disabled={sending} onClick={send} size="medium">
      {sending ? "Sending…" : "Send test email"}
    </Button>
  );
}
