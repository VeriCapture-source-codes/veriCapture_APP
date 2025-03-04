
import mongoose from "mongoose";


const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    caption: {
        type: String,
        required: true
    },
    media: {
        type: String,
        required: true
    },
    cloudinary_id: {
        String,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    location: {
        type: String,
        required: true
    }
    
}, { timestamps: true});

const postModel = mongoose.model('Post', postSchema);

export default postModel;