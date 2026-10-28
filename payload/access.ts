import type { Access } from "payload";

/**
 * Site content is public: the storefront (on Vercel) reads it over the REST
 * API without logging in. Writes keep Payload's default — logged-in users only.
 */
export const anyone: Access = () => true;
