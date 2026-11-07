import { redirect } from "next/navigation";
import { AccountPage } from "@/components/features/account/AccountPage";
import { AddressBook } from "@/components/features/account/AddressBook";
import { ProfileForm } from "@/components/features/account/ProfileForm";
import { logoutAction } from "@/lib/shop/actions/account";
import { getCustomer } from "@/lib/shop/customer";

const headingClass = "font-heading text-xl font-bold text-charcoal mb-5";

export default async function AccountOverviewPage() {
  const customer = await getCustomer();
  if (!customer) redirect("/account/login");

  return (
    <AccountPage title="Your account" width="wide">
      <div className="space-y-12">
        <section>
          <h2 className={headingClass}>Your details</h2>
          <ProfileForm name={customer.name} phone={customer.phone} email={customer.email} />
        </section>
        <section>
          <h2 className={headingClass}>Saved addresses</h2>
          <AddressBook initial={customer.addresses} />
        </section>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-muted underline underline-offset-2 hover:text-forest">
            Sign out
          </button>
        </form>
      </div>
    </AccountPage>
  );
}
