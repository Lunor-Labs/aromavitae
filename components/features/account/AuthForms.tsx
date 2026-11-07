"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormField } from "@/components/ui/FormField";
import { FormMessage } from "@/components/ui/FormMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
} from "@/lib/shop/actions/account";

const linkClass = "text-forest underline underline-offset-2 hover:text-forest-light";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(loginAction, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <FormField label="Email" name="email" type="email" autoComplete="email" required />
      <FormField label="Password" name="password" type="password" autoComplete="current-password" required />
      <FormMessage error={state.error} />
      <SubmitButton className="w-full">Sign in</SubmitButton>
      <p className="text-sm text-muted text-center">
        <Link href="/account/forgot-password" className={linkClass}>
          Forgot your password?
        </Link>
      </p>
      <p className="text-sm text-muted text-center">
        New here?{" "}
        <Link href={`/account/register?next=${encodeURIComponent(next)}`} className={linkClass}>
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action] = useActionState(registerAction, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <FormField label="Name" name="name" autoComplete="name" required />
      <FormField label="Email" name="email" type="email" autoComplete="email" required />
      <FormField label="Password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      <FormMessage error={state.error} />
      <SubmitButton className="w-full">Create account</SubmitButton>
      <p className="text-sm text-muted text-center">
        Already have an account?{" "}
        <Link href={`/account/login?next=${encodeURIComponent(next)}`} className={linkClass}>
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, {});
  return (
    <form action={action} className="space-y-5">
      <FormField label="Email" name="email" type="email" autoComplete="email" required />
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton className="w-full">Send reset link</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <FormField label="New password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      <FormMessage error={state.error} />
      <SubmitButton className="w-full">Save password</SubmitButton>
    </form>
  );
}
