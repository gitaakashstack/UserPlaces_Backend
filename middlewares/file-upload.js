import multer from "multer";
import { MulterError } from "multer";

const MIMETYPE_EXTENSION_MAP = {
  "image/jpg": ".jpg",
  "image/jpeg": ".jpeg",
  "image/png": ".png",
};
console.log(process.cwd());

const fileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      console.log(file);
      if (file.fieldname === "userImage") cb(null, "uploads/user-images"); //path is relative w.r.t the root folder app.js
      if (file.fieldname === "placeImage") cb(null, "uploads/place-images");
    },
    filename: (req, file, cb) => {
      const ext = MIMETYPE_EXTENSION_MAP[file.mimetype];
      cb(null, Date.now().toString() + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (MIMETYPE_EXTENSION_MAP[file.mimetype]) cb(null, true);
    else cb(new MulterError("Invalid File Format"), false);
  },
});

export default fileUpload;
