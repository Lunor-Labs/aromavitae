/**
 * Single source of truth for brand identity and contact details.
 *
 * The footer used to read contact info from the `footer` singleton (DB), while
 * the Contact page hardcoded its own — the two drifted apart. Both now read
 * from here.
 */

export const BRAND_NAME = "AROMAVITAE";
export const LEGAL_NAME = "Ceylon AROMAVITAE (Pvt) Ltd";
export const BRAND_TAGLINE = "NATURE'S FINEST · CEYLON'S PRIDE";
export const BRAND_DESCRIPTION =
  "Premium Ceylon spices and agarwood perfumes, crafted with passion and shipped worldwide.";

export interface ContactPhone {
  label: string;
  tel: string;
  whatsapp?: boolean;
}

export const CONTACT: {
  phones: ContactPhone[];
  email: string;
  addressLines: string[];
} = {
  phones: [
    { label: "+94 74 027 0258", tel: "+94740270258" },
    { label: "+94 77 602 8676", tel: "+94776028676", whatsapp: true },
  ],
  email: "ayubowan@ceylonaromavitae.lk",
  addressLines: [
    "Ceylon AROMAVITAE (Pvt) Ltd,",
    "Gamagedara, Godawela, Nihiluwa, Sri Lanka.",
  ],
};

export const COPYRIGHT = `© ${new Date().getFullYear()} ${LEGAL_NAME}. All Rights Reserved.`;
