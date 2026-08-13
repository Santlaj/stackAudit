import { NotFoundError } from "../../common/errors/index.js";
import { USER_ERRORS } from "./user.constants.js";
import * as userRepository from "./user.repository.js";
import type { UserProfile, UpdateUserInput } from "./user.types.js";

// Business logic for user operations.

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found", USER_ERRORS.NOT_FOUND);
  }

  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: UpdateUserInput,
): Promise<UserProfile> => {
  // Verify user exists before attempting update.
  await getUserProfile(userId);

  return userRepository.updateUser(userId, data);
};
