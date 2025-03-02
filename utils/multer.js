import multer from 'multer';
import { ApiError } from './error.js';

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024}, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(file.originalname.split('.').pop().toLocaleLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new ApiError(422, 'Invalid file type. Only JPEG, PNG, JPG and GIF are allowed'));
    }
});

export default upload;