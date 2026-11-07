"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cmsFetch } from "@/lib/shop/cms";
import { endSession, getCustomer, startSession } from "@/lib/shop/customer";
import {
  emailSchema,
  firstIssue,
  nameSchema,
  passwordSchema,
  phoneSchema,
  registerSchema,
  savedAddressSchema,
  type SavedAddress,
} from "@/lib/shop/schemas";

export interface FormState {
  error?: string;
  success?: string;
}

const text = (form: FormData, name: string) => String(form.get(name) ?? "");

/** Only ever a path on this site, so a crafted link can't send someone elsewhere after login. */
function safeNext(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : "/account";
}

async function logIn(email: string, password: string): Promise<string | null> {
  const login = await cmsFetch<{ token?: string }>("customers/login", {
    method: "POST",
    body: { email, password },
  });
  if (!login.ok || !login.data.token) return null;
  await startSession(login.data.token);
  return login.data.token;
}

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  const token = await logIn(text(form, "email").trim().toLowerCase(), text(form, "password"));
  if (!token) return { error: "That email and password don't match, or the account is locked for a few minutes." };
  redirect(safeNext(text(form, "next")));
}

export async function registerAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: text(form, "name"),
    email: text(form, "email"),
    password: text(form, "password"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const created = await cmsFetch("shop/register", { method: "POST", body: parsed.data });
  if (!created.ok) return { error: created.message };

  await logIn(parsed.data.email, parsed.data.password);
  redirect(safeNext(text(form, "next")));
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/");
}

export async function forgotPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const email = emailSchema.safeParse(text(form, "email"));
  if (!email.success) return { error: firstIssue(email.error) };
  await cmsFetch("customers/forgot-password", { method: "POST", body: { email: email.data } });
  // The same answer either way, so this can't be used to find out who has an account.
  return { success: "If there's an account with that email, a link to reset the password is on its way." };
}

export async function resetPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const password = passwordSchema.safeParse(text(form, "password"));
  if (!password.success) return { error: firstIssue(password.error) };

  const reset = await cmsFetch<{ token?: string }>("customers/reset-password", {
    method: "POST",
    body: { token: text(form, "token"), password: password.data },
  });
  if (!reset.ok) return { error: "That link has expired or was already used. Ask for a new one." };
  if (reset.data.token) await startSession(reset.data.token);
  redirect("/account");
}

const profileSchema = z.object({ name: nameSchema, phone: z.union([z.literal(""), phoneSchema]) });

export async function saveProfileAction(_: FormState, form: FormData): Promise<FormState> {
  const customer = await getCustomer();
  if (!customer) return { error: "Please sign in again." };

  const parsed = profileSchema.safeParse({ name: text(form, "name"), phone: text(form, "phone") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const saved = await cmsFetch(`customers/${customer.id}`, { method: "PATCH", body: parsed.data });
  if (!saved.ok) return { error: saved.message };
  revalidatePath("/account");
  return { success: "Saved." };
}

export async function saveAddressesAction(addresses: SavedAddress[]): Promise<FormState> {
  const customer = await getCustomer();
  if (!customer) return { error: "Please sign in again." };

  const parsed = z.array(savedAddressSchema).max(20).safeParse(addresses);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const saved = await cmsFetch(`customers/${customer.id}`, { method: "PATCH", body: { addresses: parsed.data } });
  if (!saved.ok) return { error: saved.message };
  revalidatePath("/account");
  return { success: "Saved." };
}
