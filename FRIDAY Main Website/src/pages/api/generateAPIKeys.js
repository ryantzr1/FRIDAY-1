import crypto from "crypto";
const mongoose = require("mongoose");
const axios = require("axios");
const {
  User,
} = require("/Users/ryantzr/Desktop/FridayMonitoringTool/FRIDAY Backend Server/models/user.js");

mongoose.connect(
  "mongodb+srv://fridaytech:VEWWMEMOpTUDzbQQ@fridaybackend.wjnsjbv.mongodb.net/FridayDatabase?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

function generateKey(size = 32, format = "base64") {
  const buffer = crypto.randomBytes(size);
  return buffer.toString(format);
}

function generateSecretHash(key) {
  const salt = crypto.randomBytes(8).toString("hex");
  const buffer = crypto.scryptSync(key, salt, 64);
  return `${buffer.toString("hex")}.${salt}`;
}
export default async function handler(req, res) {
  // Extract uid from the query parameters
  const { uid } = req.query;

  try {
    async function getUserInfo(uid) {
      const response = await axios.get(
        `https://friday-backend-server.herokuapp.com/userInfo?uid=${uid}`
      );
      const user = response.data;
      return user;
    }

    const user = await getUserInfo(uid);

    // if APIKey already present, return without generating a new one
    if (user && user.APIKey) {
      return res.status(200).json({ apiKey: user.APIKey });
    }

    const apiKey = generateKey();
    const hashedSecret = generateSecretHash(apiKey);

    // try {
    //   // Find the user by UID and update the information
    //   const updatedUser = await User.findOneAndUpdate(
    //     { name: "FRIDAY" },
    //     { APIKey: hashedSecret },
    //     { new: true }
    //   );

    //   if (!updatedUser) {
    //     return res.status(404).json({ error: "User not found" });
    //   }

    //   res.status(200).json({
    //     message: "User information updated",
    //     user: apiKey, //send the user the apiKey we keep the hashedSecret
    //   });
    // } catch (error) {
    //   console.error("Error updating user information:", error);
    //   res.status(500).json({ error: "Internal server error" });
    // }

    const userUpdate = `https://friday-backend-server.herokuapp.com/userUpdate?uid=${uid}`;

    await axios
      .post(userUpdate, {
        APIKey: hashedSecret,
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });

    res.status(200).json({ apiKey });
  } catch (error) {
    console.error("Error retrieving items:", error.message);
  }
}
