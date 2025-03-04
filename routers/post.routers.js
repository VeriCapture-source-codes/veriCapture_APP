import { Router } from "express";
import { createPost, deletePost, fetchPostsByLocation, fetchUserPosts, postLikes, updatePost } from "../controllers/posts.controllers.js";
import userAuth from "../auth/authMiddleware.js";


const postRouter = Router();


postRouter.post('/upload-post',userAuth ,createPost);
postRouter.get('/get-user-posts',userAuth, fetchUserPosts);
postRouter.get('/get-posts-by-location/:location',userAuth, fetchPostsByLocation);
postRouter.put('/update-post/:postId',userAuth, updatePost);
postRouter.delete('/delete-post/:postId',userAuth, deletePost);
postRouter.post('/like-post/:postId', userAuth, postLikes);

export default postRouter;