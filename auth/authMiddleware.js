
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token

        // 🔴 Check if token exists in cookies
        if (!token) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized - No Token Provided'
            });
        }

        // ✅ Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // No need for promisify
        if (!decodedToken || !decodedToken.id) {
            return res.status(403).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // ✅ Fetch user from DB
        const user = await userModel.findById(decodedToken.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user; // Attach user to request
        next(); // Pass control to next middleware
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};







export default userAuth;