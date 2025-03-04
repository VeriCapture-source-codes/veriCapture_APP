
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
    video: {
        type: String,
    },
    image: {
        type: String,
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
postSchema.pre('save', function (next) {
    if ((!this.video && !this.image) || (this.video && this.image)) {
        return next(new Error('Either video or image is required but not both'))
    }
    next();
})

const postModel = mongoose.model('Post', postSchema);

export default postModel;