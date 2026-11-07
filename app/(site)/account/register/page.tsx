import { AccountPage } from "@/components/features/account/AccountPage";
import { RegisterForm } from "@/components/features/account/AuthForms";

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function RegisterPage({ searchParams }: Props) {
  const { next } = await searchParams;
  return (
    <AccountPage title="Create an account">
      <RegisterForm next={next ?? "/account"} />
    </AccountPage>
  );
}
