"use client";

import { useActionState } from "react";
import { FormField } from "@/components/ui/FormField";
import { FormMessage } from "@/components/ui/FormMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { saveProfileAction } from "@/lib/shop/actions/account";

interface ProfileFormProps {
  name: string;
  phone: string;
  email: string;
}

export function ProfileForm({ name, phone, email }: ProfileFormProps) {
  const [state, action] = useActionState(saveProfileAction, {});
  return (
    <form action={action} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label="Name" name="name" defaultValue={name} autoComplete="name" required />
        <FormField label="Phone" name="phone" type="tel" defaultValue={phone} autoComplete="tel" />
        <FormField className="sm:col-span-2" label="Email" value={email} readOnly disabled />
      </div>
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
