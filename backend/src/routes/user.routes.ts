import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getUsers, addUser, editUser, removeUser } from "../controllers/user.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getUsers);
router.post("/", addUser);
router.put("/:id", editUser);
router.delete("/:id", removeUser);

export default router;
