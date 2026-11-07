import { z } from "zod";
import { HOME_COUNTRY, isCountryCode } from "@/lib/shop/countries";

/** What the storefront and the CMS both check. The CMS's check is the one that counts. */

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.")).pipe(z.string().max(254));

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters for your password.")
  .max(200, "That password is too long.");

export const nameSchema = z.string().trim().min(1, "Enter your name.").max(120);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[\d\s()-]{6,24}$/, "Enter a phone number, with the country code if you're outside Sri Lanka.");

export const addressFields = {
  fullName: nameSchema,
  phone: phoneSchema,
  line1: z.string().trim().min(1, "Enter your address.").max(200),
  line2: optionalText(200),
  city: z.string().trim().min(1, "Enter your city.").max(100),
  region: optionalText(100),
  postalCode: optionalText(20),
  country: z.string().refine(isCountryCode, "Choose a country."),
};

const requireDistrictAtHome = (address: { country: string; region: string }, ctx: z.RefinementCtx) => {
  if (address.country === HOME_COUNTRY && !address.region) {
    ctx.addIssue({ code: "custom", path: ["region"], message: "Enter your district." });
  }
};

export const addressSchema = z.object(addressFields).superRefine(requireDistrictAtHome);

export const savedAddressSchema = z
  .object({ ...addressFields, label: optionalText(40), isDefault: z.boolean().optional().default(false) })
  .superRefine(requireDistrictAtHome);

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type Address = z.infer<typeof addressSchema>;
export type SavedAddress = z.infer<typeof savedAddressSchema>;

/** The first problem, in words a customer can act on. */
export const firstIssue = (error: z.ZodError): string => error.issues[0]?.message ?? "Please check your details.";
