import type { User } from "@prisma/client";

export function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    countryCode: user.countryCode,
    createdAt: user.createdAt,
  };
}
