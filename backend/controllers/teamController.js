import Team from '../models/Team.js';
import User from '../models/User.js';

// GET: Fetch all teams (only name and color)
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({}, 'teamId teamName color'); // include teamId as well
    res.status(200).json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error while fetching teams' });
  }
};

// POST: Add a new team
export const addTeam = async (req, res) => {
  const { teamId, teamName, color } = req.body;

  // Simple validation
  if (!teamId || !teamName || !color) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Optional: Check if teamId or teamName already exists
    const existingTeam = await Team.findOne({ $or: [{ teamId }, { teamName }] });
    if (existingTeam) {
      return res.status(409).json({ message: 'Team with this ID or name already exists' });
    }

    const newTeam = await Team.create({ teamId, teamName, color });
    res.status(201).json(newTeam);
  } catch (err) {
    console.error('Error adding team:', err);
    res.status(500).json({ message: 'Server error while adding team' });
  }
};

// GET: Fetch users by teamId
export const getTeamMembers = async (req, res) => {
  const { teamId } = req.params;

  try {
    const users = await User.find({ teamId }).select('fullName email userName'); // Adjust fields as needed
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Server error while fetching team members' });
  }
};

// GET: Team-wise member counts
export const getTeamMemberCounts = async (req, res) => {
  try {
    const counts = await User.aggregate([
      {
        $group: {
          _id: "$teamId",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {};
    counts.forEach(item => {
      if (item._id) {
        result[item._id] = item.count;
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching member counts:', error);
    res.status(500).json({ message: 'Server error while fetching member counts' });
  }
};

// PUT: Update team name and/or color
export const updateTeam = async (req, res) => {
  const { id } = req.params;
  const { teamName, color } = req.body;

  if (!teamName || !color) {
    return res.status(400).json({ message: 'Both teamName and color are required' });
  }

  try {
    const existingWithSameName = await Team.findOne({ teamName, _id: { $ne: id } });
    if (existingWithSameName) {
      return res.status(409).json({ message: 'Team name already exists' });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { teamName, color },
      { new: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json(updatedTeam);
  } catch (err) {
    console.error('Error updating team:', err);
    res.status(500).json({ message: 'Server error while updating team' });
  }
};

// DELETE: Remove a team by ID
export const deleteTeam = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Team.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(200).json({ message: "Team deleted successfully" });
  } catch (err) {
    console.error("Error deleting team:", err);
    res.status(500).json({ message: "Server error while deleting team" });
  }
};
