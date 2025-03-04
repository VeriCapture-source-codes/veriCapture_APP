
import commentModel from '../models/commentModel.js';
import postModel from '../models/postModel.js';
import userModel from '../models/userModel.js';
import { ApiError, asyncHandler } from '../utils/error.js';


export const createComment = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { postId } = req.params;

    if (!userId || !postId) {
        return next(new ApiError(403, 'You are not authorized. Please Login and click on the post to comment'));
    }

    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
        const error = new ApiError(404, 'User not found');
        return next(error);
    }

    const post = await postModel.findById(postId);
    if (!post) {
        return next(new ApiError(404, 'Post not found'));
    }
    
    const text = req.body.text;
    if (!text) {
        return next(new ApiError(400, 'Text field is required'))
    }
    const comment = await commentModel.create({
        user: loggedInUser._id,
        post: post._id,
        text
    });

    const newComment = await commentModel.findById(comment._id);
    if (!newComment) {
        return next(new ApiError(500, 'Something went wrong'));
    }

    res.status(201).json({
        success: true,
        message: 'Comment sent successfully',
        newComment
    });
});


export const updateComment = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { commentId } = req.params;
    if (!userId || !commentId ) {
        return next(new ApiError(403, 'You are not authorized. Please Login and click on the comment you want to update'));
    }

    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
        const error = new ApiError(404, 'User not found');
        return next(error);
    }

    const comment = await commentModel.findOne({ _id: commentId, user: loggedInUser._id});
    if (!comment) {
        return next(new ApiError(404, 'Comment not found'));
    }
    const text = req.body.text;
    if (!text) {
        return next(new ApiError(400, 'Comment field is required to update'))
    }
    const commentToUpdate = await commentModel.findByIdAndUpdate(comment._id, {
    text
    }, {new: true, runValidators: true});

    res.status(201).json({
        success: true,
        message: 'Comment updated successfully',
        commentToUpdate
    });
});



export const deleteComment = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { commentId } = req.params;
    if (!userId || !commentId ) {
        return next(new ApiError(403, 'You are not authorized. Please Login and click on the comment you want to update'));
    }

    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
        const error = new ApiError(404, 'User not found');
        return next(error);
    }

    const commentToDelete = await commentModel.findOne({ _id: commentId, user: loggedInUser._id});
    if (!commentToDelete) {
        return next(new ApiError(404, 'Comment not found'));
    }

    const deletedComment = await commentModel.findByIdAndDelete(commentToDelete._id);
    res.status(204).json({
        success: true,
        message: 'Comment deleted successfully'
    });
});



export const commentLikes = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { commentId } = req.params;
    if (!userId || !commentId) {
        return next(new ApiError(403, 'You are not authorized. Please Login and go the comment you want to like'));
    }

    const user = await userModel.findById(userId);
    if (!user) {
        return next(new ApiError(404, 'User not found'));
    }

    const comment = await commentModel.findById(commentId);
    if (!comment) {
        return next(new ApiError(404, 'Comment notfound'));
    }

    const hasLiked = comment.likes.includes(user._id);
    if (hasLiked) {
        comment.likes = comment.likes.filter(id => id.toString() !== user._id);
    } else {
        comment.likes.push(user._id);
    }
    await comment.save();

    res.status(200).json({
        success: true,
        message: hasLiked? 'Comment unlike': 'Comment like'
    });


});
