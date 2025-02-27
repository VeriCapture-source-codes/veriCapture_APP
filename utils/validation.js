import Joi from "joi";
import { ApiErrors } from "./error.js";

const schema = Joi.object({
    name: Joi.string().required().trim(),
    userName: Joi.string().trim(),
    email: Joi.string().required().trim(),
    password: Joi.string().required().trim(),
    confirmPassword: Joi.string().required(),
    thumbnail: Joi.string()
});


export const registerValidation =  (req, res, next) => {
   const { error } = schema.validate(req.body)
   if (error) {
    return res.status(400).json(new ApiErrors(400, error.details[0].message));
   }

   next();
}


const loginSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
});


export const loginValidation = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json(new ApiErrors(400, error.details[0].message));
    }

    next();
} 