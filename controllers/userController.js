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
