import { Router } from "express";
import { createReply, deleteReply, replyLikes, updateReply } from "../controllers/reply.controllers.js";
import userAuth from "../auth/authMiddleware.js";

const replyRouter = Router();

replyRouter.post('/add-reply/:commentId',userAuth, createReply);
replyRouter.put('/update-reply/:replyId',userAuth, updateReply);
replyRouter.delete('/delete-reply/:replyId',userAuth, deleteReply);
replyRouter.post('/like-reply/:replyId',userAuth, replyLikes);


export default replyRouter;