import replyModel from '../models/replyModel.js';
import userModel from '../models/userModel.js';
import { ApiError, asyncHandler } from '../utils/error.js';
import commentModel from '../models/commentModel.js';


export const createReply = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { commentId } = req.params;
    const { text, parentReply } = req.body;

    if (!userId || !commentId) {
        return next(new ApiError(403, 'You are not authorized. Please Login and click on the comment to reply'));
    }

    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
        const error = new ApiError(404, 'User not found');
        return next(error);
    }
    
    // check if the comment exists.
    const comment = await commentModel.findById(commentId);
    if (!comment) {
        return next(new ApiError(404, 'Comment not found'));
    }
    
    // if replying to another reply, check if it exists.
    if (parentReply) {
        const existingReply = await replyModel.findById(parentReply);
        if (!existingReply) {
            return next(new ApiError(404, 'Parent reply not found'));
        }
    }
    


    // create the reply
    const reply = await replyModel.create({
        user: loggedInUser._id,
        comment: commentId,
        text,
        parentReply: parentReply || null
    });

    const newReply = await replyModel.findById(reply._id);
    if (!newReply) {
        return next(new ApiError(500, 'Something went wrong'));
    }

    res.status(201).json({
        success: true,
        message: 'reply sent successfully',
        newReply
    });
});


export const updateReply = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { replyId } = req.params;
    if (!userId || !replyId ) {
        return next(new ApiError(403, 'You are not authorized. Please Login and click on the reply you want to update'));
    }

    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
        const error = new ApiError(404, 'User not found');
        return next(error);
    }

    const reply = await replyModel.findOne({ _id: replyId, user: loggedInUser._id});
    if (!reply) {
        return next(new ApiError(404, 'Reply not found'));
    }
    const text = req.body.text;
    if (!text) {
        return next(new ApiError(400, 'Reply field is required to update'))
    }
    const replyToUpdate = await replyModel.findByIdAndUpdate(reply._id, {
    text
    }, {new: true, runValidators: true});

    res.status(201).json({
        success: true,
        message: 'Reply updated successfully',
        replyToUpdate
    });
});



export const deleteReply = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { replyId } = req.params;
    if (!userId || !replyId ) {
        return next(new ApiError(403, 'You are not authorized. Please Login and click on the reply you want to update'));
    }

    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
        const error = new ApiError(404, 'User not found');
        return next(error);
    }

    const replyToDelete = await replyModel.findOne({ _id: replyId, user: loggedInUser._id});
    if (!replyToDelete) {
        return next(new ApiError(404, 'Reply not found'));
    }

    const deletedReply = await replyModel.findByIdAndDelete(replyToDelete._id);
    res.status(204).json({
        success: true,
        message: 'Reply deleted successfully'
    });
});


export const replyLikes = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { replyId } = req.params;
    if (!userId || !replyId) {
        return next(new ApiError(403, 'You are not authorized. Please Login and go the reply you want to like'));
    }

    const user = await userModel.findById(userId);
    if (!user) {
        return next(new ApiError(404, 'User not found'));
    }

    const reply = await replyModel.findById(replyId);
    if (!reply) {
        return next(new ApiError(404, 'Reply notfound'));
    }

    const hasLiked = reply.likes.includes(user._id);
    if (hasLiked) {
        reply.likes = reply.likes.filter(id => id.toString() !== user._id);
    } else {
        reply.likes.push(user._id);
    }
    await reply.save();

    res.status(200).json({
        success: true,
        message: hasLiked? 'Reply unlike': 'Reply like'
    });
});