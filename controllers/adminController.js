const User = require('../models/User');

// PUT /api/admin/users/:id
const adminUpdateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user!', error: err.message });
  }
};

const adminDeleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: `User ${user.name} successfully deleted!` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user!', error: err.message });
  }
};

module.exports = {
  adminDeleteUser,
  adminUpdateUser
};
