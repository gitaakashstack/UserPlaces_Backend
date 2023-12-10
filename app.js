import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import placeRouter from "./routes/place-routes.js";
import userRouter from "./routes/user-routes.js";
import { customError, validationError } from "./models/Error.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import getCoordinates from "./util/getCoordinates.js";

const app = express();

app.use(
  "/uploads/user-images",
  express.static(path.join("uploads", "user-images"))
);

app.use(
  "/uploads/place-images",
  express.static(path.join("uploads", "place-images"))
);

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,PATCH,DELETE");
  next();
});
app.use((req, res, next) => {
  getCoordinates(
    "Ratneshwar Mahadev Temple, Manikarnika Ghat, next to cremation ground, Varanasi, Uttar Pradesh 221001",
    next
  );
});
app.use("/api/users", userRouter);
app.use("/api/places", placeRouter);
app.use((req, res, next) => {
  next(new customError("Could not find the URL", 404));
});

/*
---
Error Middlewares
---
*/
app.use((err, req, res, next) => {
  if (req.file) fs.unlink(req.file.path, (err) => {});
  next(err);
});

app.use((err, req, res, next) => {
  if (err instanceof validationError) {
    return res.status(err.statusCode).json({
      message: err.message,
      formValidationErrors: err.formValidationErrors,
    });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    console.log(111);
    return next(err);
  }

  if (err instanceof multer.MulterError) console.log("multer error");

  console.log(err);
  return res.status(err.statusCode || 500).json({ message: err.message });
});

mongoose
  .connect(
    "mongodb+srv://aakash123:password321@cluster0.5d43f.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000);
    console.log("Database connected, Starting the server");
  })
  .catch((err) => {
    console.log(err);
    console.log(
      "Could not connect to Database, Please check your internet connection"
    );
    //console.log(err);
  });

/*
const cb = (req, res, next) => {
  req.todayDate = new Date().toString();
  console.log("in first mdw");
  next();
};

app.get("/sachin", cb);

app.get("/sachin/ponting", cb);

app.use("/sachin", (req, res, next) => {
  return res.json({ responseTime: req.todayDate, url: req.originalUrl });
});

app.use((req, res, next) => {
  return res.json({ message: "Home page" });
});
*/

/*app.use("/", (req, res, next) => {
  console.log("in mdw 1");
  next();
  console.log("in mdw 11");
  res.json({ message: "responese sent" });
});
app.use((req, res, next) => {
  console.log("in mdw 2");
  next();
  console.log("in mdw 22");
});

app.use((req, res, next) => {
  console.log("in mdw 3");
});*/
