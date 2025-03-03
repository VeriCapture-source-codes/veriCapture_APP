import { Router } from "express";
import { createPost, deletePost, fetchPostsByLocation, fetchUserPosts, postLikes, updatePost } from "../controllers/posts.controllers.js";
import userAuth from "../auth/authMiddleware.js";


const postRouter = Router();


postRouter.post('/upload-post',userAuth ,createPost);
postRouter.get('/get-users-posts',userAuth, fetchUserPosts);
postRouter.get('/get-posts-by-location',userAuth, fetchPostsByLocation);
postRouter.put('/update-post',userAuth, updatePost);
postRouter.delete('delete-post/:id',userAuth, deletePost);
postRouter.post('/like-post/:id', userAuth, postLikes);

export default postRouter;