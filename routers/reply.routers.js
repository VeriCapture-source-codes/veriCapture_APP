import { Router } from "express";
import { createReply, deleteReply, replyLikes, updateReply } from "../controllers/reply.controllers.js";

const replyRouter = Router();

replyRouter.post('/add-reply', createReply);
replyRouter.put('/update-reply', updateReply);
replyRouter.delete('/delete-reply', deleteReply);
replyRouter.post('/like-reply', replyLikes);


export default replyRouter;