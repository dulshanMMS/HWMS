import User from "../models/User.js";
import Team from "../models/Team.js";

/**
 * Get the profile data of the currently authenticated user.
 * Password field is excluded for security reasons.
 * If the user is part of a team, fetch and include the team name.
 *
 * req - Express request object; expects req.user to have user ID.
 * res - Express response object used to send back JSON data.
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Retrieve user by ID, omitting password from the result
    const user = await User.findById(userId).select("-password");

    // Handle case where user is not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let teamName = null;
    // If user has a team ID, fetch the corresponding team name
    if (user.teamId) {
      const team = await Team.findOne({ teamId: user.teamId });
      teamName = team ? team.teamName : null;
    }

    // Return user data along with teamName (if any)
    res.json({
      ...user.toObject(),
      teamName,
    });
  } catch (error) {
    // Log error details for debugging and return generic server error
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update the profile data of the currently authenticated user.
 * Validates updates according to the schema.
 *
 * req - Express request object; expects updates in req.body.
 * res - Express response object used to send updated user data.
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Find user by ID and apply updates, return the new document excluding password
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,          // Return updated document
      runValidators: true // Enforce schema validation on updates
    }).select("-password");

    // Return the updated user profile
    res.json(updatedUser);
  } catch (error) {
    // Log error and notify client about update failure
    console.error("Failed to update user profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
