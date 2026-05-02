export const WANDERLY_ACCESS_COOKIE = "pp_wanderly_access";
export const WANDERLY_REFRESH_COOKIE = "pp_wanderly_refresh";
export const PP_USER_COOKIE = "pp_user";

export const cookieBaseOptions = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
