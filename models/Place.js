import mongoose from "mongoose";

const { Schema } = mongoose;
const placeSchema = new Schema({
  title: {
    type: String,
  },
  description: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  address: { type: String },
  creator: { type: mongoose.Types.ObjectId },
  image: { type: String },
});

export default mongoose.model("Place", placeSchema);
