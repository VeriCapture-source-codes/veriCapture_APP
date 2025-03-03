import { Router } from "express";
import { commentLikes, createComment, deleteComment, updateComment } from "../controllers/comments.controllers.js";

const commentRouter = Router();

commentRouter.post('/add-comment', createComment);
commentRouter.put('/update-comment', updateComment);
commentRouter.delete('/delete-comment', deleteComment);
commentRouter.post('/like-comment', commentLikes);

export default commentRouter;