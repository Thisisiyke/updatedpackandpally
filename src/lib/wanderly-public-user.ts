/** Strip secrets before sending Wanderly user records to the client. */
export function stripWanderlyUserSecrets<T extends Record<string, unknown>>(
  user: T
): Omit<T, "password"> & { password?: never } {
  const { password: _p, ...rest } = user;
  return rest as Omit<T, "password"> & { password?: never };
}
