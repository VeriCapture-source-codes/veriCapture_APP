import userModel from '../models/userModel.js';
import ApiResponse from '../utils/ApiResponse.js';
import cloudinary from '../utils/cloudinary.js';
import { ApiError, asyncHandler } from '../utils/error.js';
import upload from '../utils/multer.js';
import transporter from '../utils/nodemailer.js';
import { loginSchema, schema } from '../utils/validation.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config()


export const Register = asyncHandler(async(req, res, next) => {
    const { name, email, userName, password, confirmPassword, thumbnail} = req.body;
    const { error } =  schema.validate(req.body)
       if (error) {
           return next(new ApiError(400, error.details[0].message));
       }
    
    const existingUser = await userModel.findOne({email});
    if (existingUser) {
        const error = new ApiError(403, 'User already exist');
        return next(error);
    }
     
    if (!req.file) {
       return res.status(400).json({ status: "fail", message: "Image file is required" });
    }

    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {resource_type: 'auto'},
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );
        stream.end(req.file.buffer);
    })
    

    const user = await userModel.create({
            name,
            userName,
            email,
            password,
            confirmPassword,
            thumbnail: result.secure_url,
            cloudinary_id: result.public_id,
    });

    const newUser = await userModel.findById(user._id);
        if (!newUser) {
        const error = new ApiError(500, 'Something went wrong');
        return next(error);
        }

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: newUser.email,
        subject: '🎉 Welcome to VeriCapture – No More Fake News for You!',
        text: `Hello ${newUser.name},

            Congratulations! You just made one of the smartest decisions of your life (okay, maybe second to choosing jollof over fried rice). 
            You’re now officially part of VeriCapture—where only real-time, 
            verified content gets to shine, and fake news gets kicked to the curb.

           🚀 What’s Next?

           Capture & Share – Spot something happening? Record live and upload—no old, recycled nonsense here.

           Stay Ahead – Get real-time updates on traffic, riots, accidents, and those "avoid-this-road" situations.

           Trust the Trends – AI ensures what you see is authentic, not WhatsApp-forwarded chaos.

          💡 Pro Tip: If you ever try uploading a photo from 2016 claiming it’s "happening now," our AI will laugh at you (and then block it). Just saying.

           Go ahead, log in, explore, and see what’s real near you!

           🔗 CALL TO ACTION BUTTON

           Welcome aboard! The internet just got a little less messy—thanks to you.

           The VeriCapture Team
           Bringing the truth, one real-time upload at a time.`
    }
    await transporter.sendMail(mailOptions);

    res.status(201).json(new ApiResponse(201, 'Registration successful'));

});



export const Login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json(new ApiError(400, error.details[0].message));
        }
        
        
    const user = await userModel.findOne({email})
    if (!user) {
        const error = new ApiError(401, 'Invalid credentials', );
        return next(error);
    }
    
    const isMatch = await user.comparePassword(password, user.password)
    if (!isMatch) {
        const error = new ApiError(401, 'Invalid credentials');
        return next(error);
    }

    const loggedInUser = await userModel.findById(user._id)
    .select('name thumbnail email -_id')

    const token = jwt.sign({id: loggedInUser._id}, process.env.JWT_SECRET, { expiresIn: 3 * 24 * 60 * 60 * 1000});

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3 * 24 * 60 * 60 * 1000
    });

    res.status(200).json(new ApiResponse(200, loggedInUser, 'Login successful'))

});


export const Logout = (req, res, next) => {
    const { token } = req.cookies;
    res.clearCookie('token', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
}


export const updateUser = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    if (!userId) {
        const error = new ApiError(403, 'You are not authorized. Please login to continue');
        return next(error);
    }
    const user = await userModel.findById(userId);
    if (!user) {
        const error = new ApiError(404, 'User not found');
        return next(error);
    }

    const { name, email, thumbnail } = req.body;

    const userToUpdate = await userModel.findByIdAndUpdate(user._id, {
        $set: {
            name,
            email,
            thumbnail
        }
    }, {new: true, runValidators: true});
    await userToUpdate.save();
    
    res.status(201).json({
        success: true,
        message: 'Profile update successful'
    });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    if (!userId) {
        const error = new ApiError(403, 'You are not authorized. Please login to continue');
        return next(error);
    }
    const user = await userModel.findById(userId);
    if (!user) {
        const error = new ApiError(404, 'User not found');
        return next(error);
    }

    const userToDelete = await userModel.findByIdAndDelete(user._id);

    res.status(204).json({
        success: true,
        message: 'Your account is deleted successfully'
    });
});


export const fetchUsersByName = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    console.log("Decoded User from Token:", req.user);
    if (!userId) {
        const error = new ApiError(403, 'You are not authorized. Please login to continue');
        return next(error);
    }

    const user = await userModel.findById(userId);
    if (!user) {
        const error = new ApiError(404, 'User not found');
        return next(error);
    }

    const { name } = req.params;
    if (!name) {
            const error = new ApiError(400, 'Please provide name for the search');
            return next(error);
        }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await userModel.countDocuments({ name: { $regex: name, $options: 'i'}});
    if (!totalUsers) {
        const error = new ApiError(404, 'No users found');
        return next(error);
    }

    const foundUsers = await userModel.find({ name: { $regex: name, $options: 'i'}})
    .skip(skip)
    .limit(limit)
    .select('name thumbnail')

    if (foundUsers.length === 0) {
        const error = new ApiError(404, 'No more page available');
        return next(error);
    }

    res.status(200).json({
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        data: foundUsers,
    });
});



export const fetchOneUserById = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    if (!userId) {
        const error = new ApiError(403, 'You are not authorized. Please login to continue');
        return next(error);
    }

    const user = await userModel.findById(userId);
    if (!user) {
        const error = new ApiError(404, 'User not found');
        return next(error);
    }
    
    const { id } = req.params;
    if (!id) {
            const error = new ApiError(400, 'Please user ID in the search query');
            return next(error);
        }


    const fetchedUser = await userModel.findById(id)
    .select('name thumbnail')
    if (!fetchedUser) {
        const error = new ApiError(404, 'User not found');
        return next(error);
    }

    res.status(200).json({
        success: true,
        data: {
            id: fetchedUser._id,
            email: fetchedUser.email,
            thumbnail: fetchedUser.thumbnail
        }
    });

});