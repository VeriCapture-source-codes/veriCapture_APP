import userModel from '../models/userModel.js';
import ApiResponse from '../utils/ApiResponse.js';
import uploadToCloudinary from '../utils/cloudinary.js';
import { ApiErrors, asyncHandler } from '../utils/error.js';
import transporter from '../utils/nodemailer.js';
import { loginValidation, registerValidation } from '../utils/validation.js';
import jwt from 'jsonwebtoken';


export const Register = asyncHandler(registerValidation, async(req, res, next) => {
    const { name, email, userName, password, confirmPassword} = req.body;

    const existingUser = await userModel.findOne(email);
    if (existingUser) {
        const error = new ApiErrors(403, 'User already exist');
        return next(error);
    }
     
    const thumbnailURL = req.file['thumbnail']? req.file['thumbnail'].path : null;
    const thumbnail = uploadToCloudinary(thumbnailURL)
    const user = await userModel.create({
        name,
        userName,
        email,
        password,
        confirmPassword,
        thumbnail: thumbnail.url
    });

    const newUser = await userModel.findById(user._id);
    if (!newUser) {
        const error = new ApiErrors(500, 'Something went wrong');
        return next(error);
    }

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: newUser.email,
        subject: '<h2>🎉 Welcome to VeriCapture – No More Fake News for You!</h2>',
        text: `<p> Hello ${newUser.name},

            Congratulations! You just made one of the smartest decisions of your life (okay, maybe second to choosing jollof over fried rice). You’re now officially part of VeriCapture—where only real-time, verified content gets to shine, and fake news gets kicked to the curb.

           🚀 What’s Next?

           Capture & Share – Spot something happening? Record live and upload—no old, recycled nonsense here.

           Stay Ahead – Get real-time updates on traffic, riots, accidents, and those "avoid-this-road" situations.

           Trust the Trends – AI ensures what you see is authentic, not WhatsApp-forwarded chaos.

          💡 Pro Tip: If you ever try uploading a photo from 2016 claiming it’s "happening now," our AI will laugh at you (and then block it). Just saying.

           Go ahead, log in, explore, and see what’s real near you!

           🔗 CALL TO ACTION BUTTON

           Welcome aboard! The internet just got a little less messy—thanks to you.

           The VeriCapture Team
           Bringing the truth, one real-time upload at a time</p>`
    }
    await transporter.sendMail(mailOptions);

    res.status(201).json(new ApiResponse(201, 'Registration successful'));
});



export const Login = asyncHandler(loginValidation, async (req, res, next) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({email}).select('-password -_v -_id');
    if (!user) {
        const error = new ApiErrors(401, 'Invalid credentials');
        return next(error);
    }

    const isMatch = await user.comparePassword(password, user.password)
    if (!isMatch) {
        const error = new ApiErrors(401, 'Invalid credentials');
        return next(error);
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: 3 * 24 * 60 * 60 * 1000});
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3 * 24 * 60 * 60 * 1000
    });

    res.status(200).json(new ApiResponse(200, user, 'Login successful'))

});