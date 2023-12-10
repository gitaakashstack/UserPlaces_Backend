import { validationResult } from "express-validator";
import fs from "fs/promises";
import { customError, httpError, validationError } from "../models/Error.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getAllUsers = async function (req, res, next) {
  let users;
  try {
    users = await User.find({}, { password: 0 });
  } catch (err) {
    console.log(err);
    return next(new httpError("Cannot find users, Please try after some time"));
  }

  return res.status(200).json({
    message:
      users.length === 0 ? "No users found" : `Found ${users.length} user(s)`,
    data: users,
  });
};

export const createUser = async function (req, res, next) {
  const { name = "Default Name", email, password, places = [] } = req.body;

  const userImageFile = req.file;

  if (!validationResult(req).isEmpty()) {
    if (userImageFile) await fs.unlink(userImageFile.path);
    const valdResult = validationResult(req).mapped();
    return next(new validationError(400, valdResult));
  }

  let createdUser;
  try {
    const userExisting = await User.findOne({ email });
    if (userExisting)
      throw new httpError("User already exists, Please Log In", 409);

    const hashedPassword = await bcrypt.hash(password, 12);

    createdUser = new User({
      name,
      email,
      password: hashedPassword,
      places,
      image: userImageFile.path,
    });
    createdUser.save();
  } catch (err) {
    return next(
      err instanceof httpError
        ? err
        : new customError("Could not save user, Please try again later", 500)
    );
  }
  return res.status(200).json({
    message: "User created",
  });
};

export const loginUser = async function (req, res, next) {
  const { email, password } = req.body;
  let userLoggingIn, token;
  try {
    userLoggingIn = await User.findOne({ email }, { email: 1, password: 1 });

    if (!userLoggingIn)
      throw new httpError("Invalid Username or Password", 401);
    const isPasswordValid = await bcrypt.compare(
      password,
      userLoggingIn.password
    );

    if (!isPasswordValid)
      throw new httpError("Invalid Username or Password", 401);

    token = jwt.sign({ userID: userLoggingIn._id }, "first_fullstack_secret", {
      expiresIn: "1h",
    });
  } catch (err) {
    console.log(err);
    return next(
      err instanceof httpError
        ? err
        : new customError("Could not Log In, Please try after some time", 500)
    );
  }

  return res.status(200).json({
    message: "User successfully logged in",
    data: userLoggingIn._id,
    token,
  });
};
