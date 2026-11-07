import type { Access, FieldAccess } from "payload";

/**
 * Site content is public: the storefront (on Vercel) reads it over the REST
 * API without logging in.
 */
export const anyone: Access = () => true;

/**
 * Writes must always say who may make them. Payload's default is "any logged-in
 * user", and customers log in too: left to the default, a registered customer
 * could edit products, globals and admin accounts through the REST API.
 */
export const adminsOnly: Access = ({ req }) => req.user?.collection === "users";

export const adminsOnlyField: FieldAccess = ({ req }) => req.user?.collection === "users";

export const staffWrites = { create: adminsOnly, update: adminsOnly, delete: adminsOnly };
