import Team from '../models/Team.js';

export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({}, 'teamName color');
    res.status(200).json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error while fetching teams' });
  }
};
