import { customError, httpError, validationError } from "../models/Error.js";
import Place from "../models/Place.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import User from "../models/User.js";
import { ObjectId } from "mongodb";
import fs from "fs/promises";
import getCoordinates from "../util/getCoordinates.js";

export const getPlacesByUserID = async function (req, res, next) {
  const { uID: userID } = req.params;

  if (!validationResult(req).isEmpty()) {
    const valdResult = validationResult(req).mapped(); //extracting only the first error in entire form fields, aesthetically indicating one error at a time to the user
    /*return res.status(400).json({
      message: valdResult.msg,
      param: valdResult.param,
      loaction: valdResult.location,
    });*/

    return res.status(400).json(valdResult);
  }

  let requiredPlaces;
  try {
    requiredPlaces = await Place.find({ creator: userID }, { creator: 0 });
  } catch (err) {
    return next(
      new httpError("Could not find places, Please try again later", 500)
    );
  }
  if (requiredPlaces.length === 0)
    return res.status(200).json({
      message: "Could not find any place with the given user",
      data: requiredPlaces,
    });

  return res.status(200).json({
    message: `Found ${requiredPlaces.length} places with the given user`,
    data: requiredPlaces,
  });
};

export const getPlaceByPlaceID = async function (req, res, next) {
  const { pID: placeID } = req.params;
  let requiredPlace;
  try {
    requiredPlace = await Place.findById(placeID);
  } catch (err) {
    return next(
      new httpError("Could not find a place, Please try again later", 500)
    );
  }

  if (!requiredPlace)
    return res
      .status(200)
      .json({ message: "No place found with the given place id" });

  return res.status(200).json({ data: requiredPlace });
};

export const createNewPlace = async function (req, res, next) {
  const { title, description, address, creator } = req.body;
  const placeImageFile = req.file;

  //if(!creator!==req.userID)

  if (!validationResult(req).isEmpty()) {
    if (placeImageFile) await fs.unlink(placeImageFile.path);
    const valdResult = validationResult(req).mapped(); //extracting only the first error in entire form fields, aesthetically indicating one error at a time to the user
    return next(new validationError(400, valdResult));
  }

  const newPlace = new Place({
    title,
    description,
    address,
    creator: mongoose.Types.ObjectId(creator),
    image: placeImageFile.path,
  });

  getCoordinates(address);
  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    await newPlace.save({ session });
    await User.updateOne(
      { _id: creator },
      {
        $push: { places: newPlace._id },
      },
      { session }
    );
    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    session.endSession();
    return next(
      new httpError("Cannot Create Place, Please Try After Some Time", 500)
    );
  }

  return res.status(201).json({
    message: "New place created successfully",
    createdPlace: newPlace.toObject(),
  });
};

export const updatePlaceByID = async function (req, res, next) {
  const { pID: placeID } = req.params;
  const { title, description } = req.body;

  if (!validationResult(req).isEmpty()) {
    const valdResult = validationResult(req).mapped(); //extracting only the first error in entire form fields, aesthetically showing one error at a time to the user,if desired we can also send all the errors in form fields at once
    return next(new validationError(400, valdResult));
  }

  let requiredPlace;
  try {
    requiredPlace = await Place.findById(placeID);
    if (!requiredPlace) throw new httpError("No place found", 404);

    if (requiredPlace.creator.toString() !== req.userID)
      throw new httpError("You are not allowed to update this place", 401);
  } catch (err) {
    return next(
      err instanceof httpError
        ? err
        : new customError(
            "Could not Update Place, Please try after some time",
            500
          )
    );
  }

  requiredPlace.title = title;
  requiredPlace.description = description;

  try {
    await requiredPlace.save();
  } catch (err) {
    return next(
      new httpError("Could not update place, Please try again later", 500)
    );
  }

  return res.status(200).json({
    message: "Place updated",
    newPlace: requiredPlace,
  });
};

export const deletePlaceByID = async function (req, res, next) {
  const { pID: placeID } = req.params;

  const { creator } = await Place.findById({ _id: placeID }, { creator: 1 });

  if (creator.toString() !== req.userID)
    return next(new httpError("You are not allowed to delete this place", 401));

  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    await Place.deleteOne({ _id: placeID }, { session });
    await User.updateOne(
      { _id: creator },
      {
        $pull: {
          places: { $eq: ObjectId(placeID) },
        },
      },
      { session }
    );
    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    session.endSession();
    return next(new httpError("Could not delete the given place", 500));
  }
  return res.status(200).json({
    message: "Place deleted",
  });
};
