const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT Secret (в продакшене должен быть в переменных окружения)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Helper function for API responses
const apiResponse = (success, data = null, message = "", status = 200) => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString(),
});

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res
      .status(401)
      .json(apiResponse(false, null, "Access token required"));
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json(apiResponse(false, null, "Invalid or expired token"));
    }
    req.user = user;
    next();
  });
};

// User registration
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            null,
            "Missing required fields: email, password, name"
          )
        );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Invalid email format"));
    }

    // Password validation
    if (password.length < 6) {
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            null,
            "Password must be at least 6 characters long"
          )
        );
    }

    // Role validation (only allow admin creation with special parameter)
    const userRole =
      role === "admin" && req.body.create_admin === true ? "admin" : "user";

    const user = await User.create({
      email: email.trim(),
      password,
      name: name.trim(),
      role: userRole,
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json(
      apiResponse(
        true,
        {
          user: user.toJSON(),
          token,
        },
        "User registered successfully"
      )
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error.message === "User already exists") {
      return res
        .status(409)
        .json(apiResponse(false, null, "User with this email already exists"));
    }

    res.status(500).json(apiResponse(false, null, "Registration failed"));
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Email and password are required"));
    }

    // Verify credentials
    const user = await User.verifyPassword(email, password);

    if (!user) {
      return res
        .status(401)
        .json(apiResponse(false, null, "Invalid email or password"));
    }

    // Generate token
    const token = generateToken(user);

    res.json(
      apiResponse(
        true,
        {
          user: user.toJSON(),
          token,
        },
        "Login successful"
      )
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json(apiResponse(false, null, "Login failed"));
  }
});

// User logout (client-side token removal, server-side stateless)
router.post("/logout", async (req, res) => {
  res.json(apiResponse(true, null, "Logged out successfully"));
});

// Get user profile (protected route)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json(apiResponse(false, null, "User not found"));
    }

    res.json(
      apiResponse(true, user.toJSON(), "Profile retrieved successfully")
    );
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json(apiResponse(false, null, "Failed to get profile"));
  }
});

// Update user profile (protected route)
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json(apiResponse(false, null, "User not found"));
    }

    const updatedUser = await user.update(req.body);

    res.json(
      apiResponse(true, updatedUser.toJSON(), "Profile updated successfully")
    );
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json(apiResponse(false, null, "Failed to update profile"));
  }
});

// Change password (protected route)
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            null,
            "Current password and new password are required"
          )
        );
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            null,
            "New password must be at least 6 characters long"
          )
        );
    }

    // Verify current password
    const user = await User.verifyPassword(req.user.email, currentPassword);
    if (!user) {
      return res
        .status(401)
        .json(apiResponse(false, null, "Current password is incorrect"));
    }

    // Update password
    await user.updatePassword(newPassword);

    res.json(apiResponse(true, null, "Password changed successfully"));
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json(apiResponse(false, null, "Failed to change password"));
  }
});

// Admin routes
// Get all users (admin only)
router.get("/admin/users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json(apiResponse(false, null, "Admin access required"));
    }

    const filters = {
      role: req.query.role,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
    };

    const users = await User.findAll(filters);

    res.json(
      apiResponse(
        true,
        users.map((user) => user.toJSON()),
        "Users retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json(apiResponse(false, null, "Failed to get users"));
  }
});

// Create admin user (special endpoint for initial setup)
router.post("/create-admin", async (req, res) => {
  try {
    const { email, password, name, adminKey } = req.body;

    // Simple admin key check (в продакшене лучше использовать более сложную логику)
    if (adminKey !== "create-admin-2024") {
      return res
        .status(403)
        .json(apiResponse(false, null, "Invalid admin key"));
    }

    // Check if admin already exists
    const existingAdmin = await User.findByEmail(email);
    if (existingAdmin) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Admin user already exists"));
    }

    const admin = await User.create({
      email: email.trim(),
      password,
      name: name.trim(),
      role: "admin",
    });

    res
      .status(201)
      .json(
        apiResponse(true, admin.toJSON(), "Admin user created successfully")
      );
  } catch (error) {
    console.error("Create admin error:", error);
    res
      .status(500)
      .json(apiResponse(false, null, "Failed to create admin user"));
  }
});

// Export middleware for other routes
router.authenticateToken = authenticateToken;

module.exports = router;
