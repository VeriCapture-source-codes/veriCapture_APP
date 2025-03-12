
import postModel from '../models/postModel.js';
import userModel from '../models/userModel.js';
import  { asyncHandler, ApiError } from '../utils/error.js'
import cloudinary from '../utils/cloudinary.js';


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
     // console.log("Received file:", req.file);

const { caption, location} = req.body;

if (!caption) {
    return next(new ApiError(400, "Caption is required."));
}

if (!location) {
    return next(new ApiError(400, "Caption is required."));
}


    // const result = await new Promise((resolve, reject) => {
    //     const stream = cloudinary.uploader.upload_stream(
    //         {resource_type: 'auto'},
    //         (error, result) => {
    //             if (error) {
    //                 return reject(error);
    //             }
    //             resolve(result);
    //         }
    //     );
    //     stream.end(req.file.buffer);
    // });

    if (!req.file) {
          return res.status(400).json({ message: "Either a video or an image is required." });
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
        
        const uploadResult = await result;
        

    
    const post = await postModel.create({
        user: loggedInUser._id,
        media: uploadResult.secure_url,
        caption,
        location,
        cloudinary_id: uploadResult.public_id
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
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const totalPosts = await postModel.countDocuments({ user: loggedInUser._id});
    if (!totalPosts) {
        const error = new ApiError(404, 'No posts found');
        return next(error);
    }
    const posts = await postModel.find({ user: loggedInUser._id})
    .populate('user', 'name thumbnail')
    .populate('likes', 'name thumbnail')
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
    const { location } = req.params;
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
    const limit = parseInt(req.query.limit) || 10;
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
    .populate('likes', 'name thumbnail')
    .populate('user', 'name thumpnaail')

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
    const { postId } = req.params;
    if (!userId || !postId) {
            const error = new ApiError(403, 'You are not authorized. Please login to continue and click on the post you want to update');
            return next(error);
        }

    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
           const error = new ApiError(404, 'User not found');
           return next(error);
        }
    
        const postToUpdate = await postModel.findOne({ _id: postId, user: loggedInUser._id});
        if (!postToUpdate) {
            const error = new ApiError(404, 'Post not found');
            return next(error);
        }
    
    // const { video, image, caption, location} = req.body;
    // if ((!video && !image && caption && location) || (video && image)) {
    //     const error = new ApiError(400, 'Either video or image is required not both and caption is also required');
    //     return next(error);
    // }

    const { media, caption, location} = req.body;

// if (!video && !image) {
//     return next(new ApiError(400, "Either a video or an image is required."));
// }

// if (video && image) {
//     return next(new ApiError(400, "You can only upload either a video or an image, not both."));
// }

// if (!caption) {
//     return next(new ApiError(400, "Caption is required."));
// }

// if (!location) {
//     return next(new ApiError(400, "Caption is required."));
// }

        // 🔵 If a new file is uploaded, handle streaming upload
    if (req.file) {
            // Delete old image from Cloudinary if exists
       if (postToUpdate.cloudinary_id) {
      await cloudinary.uploader.destroy(postToUpdate.cloudinary_id);
      }

    }  
    
   const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
                (error, result) => {
                    if (error) return reject(error);
                        resolve(result);
                    }
            );
            stream.end(req.file.buffer);
    });

    // Await Cloudinary upload result
    const uploadResult = await uploadPromise;
            

    const updatedPost = await postModel.findByIdAndUpdate(postToUpdate._id, {
        $set: {
            media: uploadResult.secure_url,
            caption,
            location,
            cloudinary_id: uploadResult.public_id
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
    const { postId } = req.params;

    if (!userId || !postId) {
            const error = new ApiError(403, 'You are not authorized. Please login to continue and click on the post you want to update');
            return next(error);
        }

    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
           const error = new ApiError(404, 'User not found');
           return next(error);
        }
    
    const postToDelete = await postModel.findOne({ _id: postId, user: loggedInUser._id});
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
    console.log("Post found:", post);
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