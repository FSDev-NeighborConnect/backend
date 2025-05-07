const User = require ('../models/User');

exports.getUserById = async (req, res, next) =>{
    try {
        const userId = req.params.id; // Get user Id from request
        const user = await User.findById(userId).select ('-password');
        if(user){
            return res.status(200).json(user)
        } else {
            return res.status(404).json({message: 'User not found'})
        }
    } catch (err) {
        next(err);
    }
}


exports.getAllUsers = async (req, res, next) => {
    try {
        const allUsers = await User.find().select('-password');
        if(allUsers){
            return res.status(200).json(allUsers)
        } else {
            return res.status(404).json({message: 'No Users found'});
        } 
    }catch (err){
            next(err);
        }
    }

exports.updateUser = async (req, res) => {
    const { id } = req.params;

    // blocks if requesting user's id (from token) is not same as target user id
    if (req.user.id !== id) {
        return res.status(403).json({ message: 'You can only update your own profile!' });
    }

    try {
        const updates = req.body;
        const user = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!user) return res.status(404).json({ message: 'User not found!' });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update profile', error: err.message });
    }
};