import { z } from "zod";

// Zod schema for PATCH /api/users/me request body.
// At least one field must be provided.

export const updateUserSchema = z
  .object({
    name: z.string().min(1, "Name cannot be empty").max(100).optional(),
    image: z.string().url("Image must be a valid URL").nullable().optional(),
  })
  .refine((data) => data.name !== undefined || data.image !== undefined, {
    message: "At least one field (name or image) must be provided",
  });

export type UpdateUserBody = z.infer<typeof updateUserSchema>;
