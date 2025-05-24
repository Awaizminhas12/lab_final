const User = require('../models/User');

// Update Profile
exports.updateProfile = async (req, res) => {
  const { bio, avatar } = req.body;

  const user = await User.findById(req.userId);
  if (bio) user.profile.bio = bio;
  if (avatar) user.profile.avatar = avatar;

  await user.save();
  res.status(200).json({ message: 'Profile updated successfully' });
};

// Get Profile
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user.profile);
};
