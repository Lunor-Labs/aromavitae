import { AccountPage } from "@/components/features/account/AccountPage";
import { LoginForm } from "@/components/features/account/AuthForms";

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  return (
    <AccountPage title="Sign in">
      <LoginForm next={next ?? "/account"} />
    </AccountPage>
  );
}
