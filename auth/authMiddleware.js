
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';


const userAuth = async (req, res, next) => {
    try {
        // console.log("Cookies received:", req.cookies); // Debugging log
        
        const { token } = req.cookies;

        if (!token) {
            // console.log("No token found in cookies"); // Debugging log
            return res.status(403).json({
                success: false,
                message: 'You are not authorized - Please Login'
            });
        }
        
        // console.log("Received Token:", token); // Debugging log

        // ✅ Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded Token:", decodedToken); // Debugging log

        if (!decodedToken || !decodedToken.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized - Invalid token'
            });
        }

        // ✅ Fetch user from DB
        const user = await userModel.findById(decodedToken.id);
        if (!user) {
            // console.log("User not found in database"); // Debugging log
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user; // Attach user to request
        // console.log("User authenticated:", req.user); // Debugging log
        next(); // Pass control to next middleware
    } catch (error) {
        // console.log("Authentication Error:", error.message); // Debugging log
        return res.status(403).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};


// const userAuth = async (req, res, next) => {
//     try {
//         const { token } = req.cookies

//         // 🔴 Check if token exists in cookies
//         if (!token) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'You are not authorized - Please Login'
//             });
//         }
//         console.log(token);
        

//         // ✅ Verify token
//         const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//         if (!decodedToken || !decodedToken.id) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'You are not authorized - Invalid token'
//             });
//         }
//         console.log(decodedToken);
        

//         // ✅ Fetch user from DB
//         const user = await userModel.findById(decodedToken.id);
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         req.user = user; // Attach user to request
//         next(); // Pass control to next middleware
//     } catch (error) {
//         return res.status(403).json({
//             success: false,
//             message: 'Authentication failed',
//             error: error.message
//         });
//     }
// };







export default userAuth;