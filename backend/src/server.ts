import app from "./app";
import { initializeDatabase } from "./models/user.model";

const PORT = parseInt(process.env.PORT || "3000", 10);

const start = async (): Promise<void> => {
  try {
    await initializeDatabase();
    console.log("Database initialized successfully.");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
