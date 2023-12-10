import { httpError } from "../models/Error.js";
import jwt from "jsonwebtoken";

export default function (req, res, next) {
  if (req.method === "OPTIONS") return next();
  if (!req.get("Authorization"))
    return next(new httpError("Invalid User", 401));

  const token = req.get("Authorization").split(" ")[1];
  if (!token) next(new httpError("Invalid User", 401));
  else {
    const { userID } = jwt.verify(token, "first_fullstack_secret");
    req.userID = userID;
    next();
  }
}
