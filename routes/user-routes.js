import express from "express";
import {
  createUser,
  getAllUsers,
  loginUser,
} from "../controllers/users-controller.js";
import { body } from "express-validator";
import fileUpload from "../middlewares/file-upload.js";

const router = express.Router();

router.get("/", getAllUsers);

router.post(
  "/signup",
  fileUpload.single("userImage"),
  body("name", "Invalid Name")
    .exists({ checkFalsy: true })
    .withMessage("Name cannot be empty"),
  body("email", "Invalid Email")
    .exists({ checkFalsy: true })
    .withMessage("Email cannot be empty")
    .bail()
    .isEmail()
    .withMessage("Invalid Email"),
  body("password")
    .isLength({ min: 4 })
    .withMessage("Password must be atleast 4 characters long"),
  body("cnfpassword").custom((val, { req }) => {
    if (val !== req.body.password) throw "Password does not match";
    return true;
  }),
  createUser
);

router.post(
  "/signin",
  (req, res, next) => {
    setTimeout(() => next(), 2000);
  },
  loginUser
);

export default router;
