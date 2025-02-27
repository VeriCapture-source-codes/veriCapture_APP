import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (filepath) => {
    try {
        if (!filepath) return null;

       const response = await cloudinary.uploader.upload(filepath, {
       resource_type: 'auto'
   });
       console.log('file upload successful', response.url);
       fs.unlinkSync(filepath)
    } catch (error) {
        fs.unlinkSync(filepath)
    }
}


export default uploadToCloudinary;