import { Prisma } from "@prisma/client";

import { type User } from "~/types/user";

export const UserQuery = Prisma.validator<Prisma.UserDefaultArgs>()({});

export const PrismaUserToUser = (
  user: Prisma.UserGetPayload<typeof UserQuery>
): User => {
  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? "",
    emailVerified: user.emailVerified ?? undefined,
  };
};
