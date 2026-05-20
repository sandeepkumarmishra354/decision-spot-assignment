import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  findAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../models/user.model";

export const getUsers = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await findAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

export const addUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res
        .status(400)
        .json({ error: "Name, email, and password are required." });
      return;
    }

    const user = await createUser(name, email, password);
    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(409).json({ error: "A user with this email already exists." });
      return;
    }
    console.error("Add user error:", error);
    res.status(500).json({ error: "Failed to create user." });
  }
};

export const editUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { name, email } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: "Name and email are required." });
      return;
    }

    const user = await updateUser(id, name, email);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.json(user);
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(409).json({ error: "A user with this email already exists." });
      return;
    }
    console.error("Edit user error:", error);
    res.status(500).json({ error: "Failed to update user." });
  }
};

export const removeUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const deleted = await deleteUser(id);

    if (!deleted) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Remove user error:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
};
