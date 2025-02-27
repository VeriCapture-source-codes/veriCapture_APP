import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { ApiErrors } from './error.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './upload');
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        cb(null, `${uuid}-${originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype[0] === 'image') {
      return  cb(null, true)
    } else {
        cb(new ApiErrors(403, 'File type not accepted, Please upload an image file'), false);
    }
}

const upload = multer({storage, fileFilter});

export default upload;