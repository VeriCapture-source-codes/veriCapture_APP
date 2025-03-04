import multer from 'multer';
import { ApiError } from './error.js';

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000 * 1024 * 1024}, // 5GB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|mp4|webm|mov|wmv|mkv|ogv|3gp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(file.originalname.split('.').pop().toLocaleLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new ApiError(422, 'Invalid file type. Only JPEG, PNG, JPG and GIF, MP4, WEBM, MOV, WMV, MKV, OGV, EGP are allowed'));
    }
});

export default upload;