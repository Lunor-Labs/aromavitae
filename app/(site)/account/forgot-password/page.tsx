import { AccountPage } from "@/components/features/account/AccountPage";
import { ForgotPasswordForm } from "@/components/features/account/AuthForms";

export default function ForgotPasswordPage() {
  return (
    <AccountPage title="Reset your password">
      <ForgotPasswordForm />
    </AccountPage>
  );
}
