import mongoose from "mongoose";
import Place from "./Place.js";

const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  places: [{ type: mongoose.Types.ObjectId, ref: Place }],
  image: { type: String },
});

export default mongoose.model("User", userSchema);
