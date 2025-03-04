import { Router } from "express";
import { commentLikes, createComment, deleteComment, updateComment } from "../controllers/comments.controllers.js";
import userAuth from "../auth/authMiddleware.js";

const commentRouter = Router();

commentRouter.post('/add-comment/:postId',userAuth, createComment);
commentRouter.put('/update-comment/:commentId',userAuth, updateComment);
commentRouter.delete('/delete-comment/:commentId',userAuth, deleteComment);
commentRouter.post('/like-comment/:commentId',userAuth, commentLikes);

export default commentRouter;