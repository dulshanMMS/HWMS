import Team from '../models/Team.js';

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
