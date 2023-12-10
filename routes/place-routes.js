import express from "express";
import { body, param } from "express-validator";
import {
  createNewPlace,
  deletePlaceByID,
  getPlaceByPlaceID,
  getPlacesByUserID,
  updatePlaceByID,
} from "../controllers/places-controller.js";
import fileUpload from "../middlewares/file-upload.js";
import checkAuth from "../middlewares/auth.js";
import getCoordinates from "../util/getCoordinates.js";

const router = express.Router();

const titleValidationMiddleware = body("title", "Invalid title input")
  .exists({ checkFalsy: true })
  .withMessage("Title cannot be empty")
  .bail()
  .isAlphanumeric("en-US", { ignore: " ," })
  .withMessage(
    "Title can only contain alphanumeric characters including underscore"
  );

const descriptionValidationMiddleware = body(
  "description",
  "Invalid description input"
)
  .exists({ checkFalsy: true })
  .withMessage("Description cannot be empty");

router.get(
  "/user/:uID",
  [param("uID").isMongoId().withMessage("Invalid User ID")],
  getPlacesByUserID
);

router.get("/:pID", getPlaceByPlaceID);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("placeImage"),
  [
    titleValidationMiddleware,
    descriptionValidationMiddleware,
    body("address").custom((val, { req }) => {
      return getCoordinates(val)
        .then((coordinates) => (req.coordinates = coordinates))
        .catch((err) => Promise.reject(err.message));
    }),
  ],
  createNewPlace
);

router.patch(
  "/:pID",
  [param("pID").isMongoId().withMessage("Invalid Place ID")],
  [titleValidationMiddleware, descriptionValidationMiddleware],
  updatePlaceByID
);

router.delete("/:pID", [param("pID").isMongoId()], deletePlaceByID);

export default router;
