import postModel from '../models/postModel.js';
import userModel from '../models/userModel.js';
import  { asyncHandler, ApiError } from '../utils/error.js'


export const createPost = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    if (!userId) {
            const error = new ApiError(403, 'You are not authorized. Please login to continue');
            return next(error);
        }

    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
           const error = new ApiError(404, 'User not found');
           return next(error);
    }

const { video, image, caption, location} = req.body;

if (!video && !image) {
    return next(new ApiError(400, "Either a video or an image is required."));
}

if (video && image) {
    return next(new ApiError(400, "You can only upload either a video or an image, not both."));
}

if (!caption) {
    return next(new ApiError(400, "Caption is required."));
}

if (!location) {
    return next(new ApiError(400, "Caption is required."));
}

    const post = await postModel.create({
        user: loggedInUser._id,
        video,
        image,
        caption,
        location
    });

    res.status(201).json({
        success: true,
        message: 'Post upload successful',
        post
    });
});


export const fetchUserPosts = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    if (!userId) {
            const error = new ApiError(403, 'You are not authorized. Please login to continue');
            return next(error);
        }

    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
           const error = new ApiError(404, 'User not found');
           return next(error);
        }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) | 10;
    const skip = (page - 1) * limit;
    
    const totalPosts = await postModel.countDocuments({ user: loggedInUser._id});
    if (!totalPosts) {
        const error = new ApiError(404, 'No posts found');
        return next(error);
    }
    const posts = await postModel.find({ user: loggedInUser._id})
    .populate('user', 'name')
    .sort({ createdAt: -1})
    .skip(skip)
    .limit(limit)

    if (posts.length === 0) {
        const error = new ApiError(404, 'No more page available');
        return next(error);
    }

    res.status(200).json({
        success: true,
        count: posts.length,
        currentPage: page,
        hasNextPage: page * limit < totalPosts,
        totalPosts,
        totalPage: Math.ceil(totalPosts/limit),
        hasPrevPage: page > 1,
        posts
    });
});


export const fetchPostsByLocation = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const location = req.params.location;
    if (!userId) {
            const error = new ApiError(403, 'You are not authorized. Please login to continue');
            return next(error);
        }

    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
           const error = new ApiError(404, 'User not found');
           return next(error);
        }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) | 10;
    const skip = (page - 1) * limit;

    const totalPosts = await postModel.countDocuments({location: { $regex: location, $options: 'i'}});
    if (!totalPosts) {
        const error = new ApiError(404, 'No posts found');
        return next(error);
    }

    const posts = await postModel.find({location: { $regex: location, $options: 'i'}})
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit)
    .populate('postId', 'video image location')
    .populate('userId', 'name thumpnaail')

    if (posts.length === 0) {
        const error = new ApiError(404, 'No more page available');
        return next(error);
    }

    res.status(200).json({
        success: true,
        count: posts.length,
        currentPage: page,
        hasNextPage: page * limit < totalPosts,
        totalPosts,
        totalPage: Math.ceil(totalPosts/limit),
        hasPrevPage: page > 1,
        posts
    });
});


export const updatePost = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const id = req.params.id;
    if (!userId || !id) {
            const error = new ApiError(403, 'You are not authorized. Please login to continue and click on the post you want to update');
            return next(error);
        }

    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
           const error = new ApiError(404, 'User not found');
           return next(error);
        }
    
        const postToUpdate = await postModel.findOne({ _id: id, user: loggedInUser._id});
        if (!postToUpdate) {
            const error = new ApiError(404, 'Post not found');
            return next(error);
        }
    
    const { video, image, caption, location} = req.body;
    if ((!video && !image && caption && location) || (video && image)) {
        const error = new ApiError(400, 'Either video or image is required not both and caption is also required');
        return next(error);
    }

    const updatedPost = await postModel.findByIdAndUpdate(postToUpdate._id, {
        $set: {
            video,
            image,
            caption,
            location
        }
    }, {new: true, runValidators: true});

    res.status(201).json({
        success: true,
        message: 'Post update Successful',
        updatedPost
    });
});


export const deletePost = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const id = req.params.id;

    if (!userId || !id) {
            const error = new ApiError(403, 'You are not authorized. Please login to continue and click on the post you want to update');
            return next(error);
        }

    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
           const error = new ApiError(404, 'User not found');
           return next(error);
        }
    
    const postToDelete = await postModel.findOne({ _id: id, user: loggedInUser._id});
    if (!postToDelete) {
           const error = new ApiError(404, 'Post not found');
           return next(error);
    }

    const deletedPost = await postModel.findByIdAndDelete(postToDelete._id);
    res.status(204).json({
        success: true,
        message: 'Post deleted successfully'
    });
});



export const postLikes = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { postId } = req.params;
    if (!userId) {
        return next(new ApiError(403, 'You are not authorized. Please Login'));
    }

    console.log("postId from params:", postId);

    if (!postId) {
    return next(new ApiError(400, "Post ID is required. Please click on the post you want to like."));
}

    const user = await userModel.findById(userId);
    if (!user) {
        return next(new ApiError(404, 'User not found'));
    }

    const post = await postModel.findById(postId);
    if (!post) {
        return next(new ApiError(404, 'Post notfound'));
    }

    const hasLiked = post.likes.includes(user._id);
    if (hasLiked) {
        post.likes = post.likes.filter(id => id.toString() !== user._id);
    } else {
        post.likes.push(user._id);
    }
    await post.save();

    res.status(200).json({
        success: true,
        message: hasLiked? 'Post unlike': 'Post like'
    });
});