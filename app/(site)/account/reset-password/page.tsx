import Link from "next/link";
import { AccountPage } from "@/components/features/account/AccountPage";
import { ResetPasswordForm } from "@/components/features/account/AuthForms";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

/** Also where a guest's "set your password" email lands. */
export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
  return (
    <AccountPage title="Choose a password">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-sm text-muted">
          This link isn&apos;t complete.{" "}
          <Link href="/account/forgot-password" className="text-forest underline underline-offset-2">
            Ask for a new one
          </Link>
          .
        </p>
      )}
    </AccountPage>
  );
}
