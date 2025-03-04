import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        console.log("Cookies:", req.cookies); // Debugging log

        const token = req.cookies?.token; // Get token from cookies
        if (!token) {
            console.log("No token found in cookies"); // Debug log
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decodedToken); // Debug log

        req.user = decodedToken;
        next();
    } catch (error) {
        console.log("JWT Verification Error:", error.message); // Debug log
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};


export default authMiddleware;
