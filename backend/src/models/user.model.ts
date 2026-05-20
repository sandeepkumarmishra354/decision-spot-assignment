import pool from "../config/db";
import bcrypt from "bcryptjs";

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
}

// Create users table if it doesn't exist
export const initializeDatabase = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `);

  // Seed admin user if no users exist
  const result = await pool.query("SELECT COUNT(*) FROM users");
  if (parseInt(result.rows[0].count, 10) === 0) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      ["Admin", "admin@app.com", hashedPassword]
    );
    console.log("Seeded admin user: admin@app.com / admin123");
  }
};

export const findAllUsers = async (): Promise<User[]> => {
  const result = await pool.query(
    "SELECT id, name, email FROM users ORDER BY id ASC"
  );
  return result.rows;
};

export const findUserById = async (id: number): Promise<User | null> => {
  const result = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query(
    "SELECT id, name, email, password FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
};

export const createUser = async (
  name: string,
  email: string,
  password: string
): Promise<User> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
    [name, email, hashedPassword]
  );
  return result.rows[0];
};

export const updateUser = async (
  id: number,
  name: string,
  email: string
): Promise<User | null> => {
  const result = await pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email",
    [name, email, id]
  );
  return result.rows[0] || null;
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
};
