import fetch from "node-fetch";
import { customError } from "../models/Error.js";

const API_KEY = "f0a57a7e470ace0948283b45a87f41a8";

const getCoordinates = async function (address, next) {
  let coordinates;
  const requestURL = `http://api.positionstack.com/v1/forward?access_key=${API_KEY}&query=${encodeURIComponent(
    address
  )}`;
  try {
    const response = await fetch(requestURL);
    const responseBody = await response.json();
    if (responseBody.error)
      throw new customError(
        "Something went wrong, Please try again after some time",
        500
      );
    if (responseBody.data.length === 0)
      throw new customError("Invalid Address", 422);
    const { latitude, longitude } = responseBody.data[0];
    coordinates = { lat: latitude, lng: longitude };
    console.log(coordinates);
    return coordinates;
  } catch (err) {
    throw err;
  }
};

export default getCoordinates;
