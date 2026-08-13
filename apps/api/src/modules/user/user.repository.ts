import { prisma } from "../../infrastructure/prisma/index.js";
import type { UserProfile, UpdateUserInput } from "./user.types.js";

// Data access layer for the user module.
// All database queries for users go through this file.

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const findUserById = async (id: string): Promise<UserProfile | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: USER_SELECT,
  });
};

export const updateUser = async (
  id: string,
  data: UpdateUserInput,
): Promise<UserProfile> => {
  return prisma.user.update({
    where: { id },
    data,
    select: USER_SELECT,
  });
};
