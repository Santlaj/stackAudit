import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { updateUserSchema } from "./user.validation.js";
import { getMe, updateMe } from "./user.controller.js";

const userRouter = Router();

// All user routes require authentication.
userRouter.use(requireAuth);

// GET  /api/users/me — Get my profile
userRouter.get("/me", getMe);

// PATCH /api/users/me — Update my profile
userRouter.patch("/me", validate({ body: updateUserSchema }), updateMe);

export default userRouter;
