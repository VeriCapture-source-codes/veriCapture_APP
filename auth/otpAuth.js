import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const otpAuth = async (req, res, next) => {
  try {
    // console.log("Cookies received:", req.cookies); // Debugging log

    const { token } = req.cookies;

    if (!token) {
      // console.log("No token found in cookies"); // Debugging log
      return res.status(403).json({
        success: false,
        message: "You are not authorized - Please Login",
      });
    }

    // console.log("Received Token:", token); // Debugging log

    //  Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded Token:", decodedToken); // Debugging log

    if (!decodedToken || !decodedToken.email) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized - Invalid token",
      });
    }

    //  Fetch user from DB
    const user = await userModel.findOne({ email: decodedToken.email });
    if (!user) {
      // console.log("User not found in database"); // Debugging log
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user; // Attach user to request
    // console.log("User authenticated:", req.user); // Debugging log
    next(); // Pass control to next middleware
  } catch (error) {
    // console.log("Authentication Error:", error.message); // Debugging log
    return res.status(403).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

export default otpAuth;

// userRouter.post("/reset-password", async (req, res) => {
//   const { email, OTP, newPassword } = req.body;
//   try {
//     if (!email || !newPassword || !OTP) {
//       return res.status(400).json({
//         success: false,
//         message: "E-mail, OTP and newPassword are required",
//       });
//     }

//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }
//     if (user.resetPasswordOTP === "" || user.resetPasswordOTP !== OTP) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid OTP. Please try again",
//       });
//     }
//     if (user.resetPasswordOTPExpireAt < Date.now()) {
//       return res.status(410).json({
//         success: false,
//         message: "OTP expired. Please request again",
//       });
//     }
//     user.password = newPassword;
//     user.resetPasswordOTP = "";
//     user.resetPasswordOTPExpireAt = Date.now();
//     await user.save();

//     res.status(201).json({
//       success: true,
//       message: "Password reset successfully",
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// });
