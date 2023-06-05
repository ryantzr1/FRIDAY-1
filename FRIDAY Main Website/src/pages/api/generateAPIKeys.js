import crypto from "crypto";
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });

//Generate API Key for customers
// function generateKey(size = 32, format = "base64") {
//   const buffer = crypto.randomBytes(size);
//   return buffer.toString(format);
// }

//Generate Secret Hash that we store in our MongoDB
function generateHash(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

// function encryptKey(key) {
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv(
//     algorithm,
//     Buffer.from(ENCRYPTION_KEY, "hex"),
//     iv
//   );
//   const encrypted = Buffer.concat([cipher.update(key), cipher.final()]);

//   return {
//     iv: iv.toString("hex"),
//     encryptedData: encrypted.toString("hex"),
//   };
// }

// function decryptKey(encryptedKey) {
//   const decipher = crypto.createDecipheriv(
//     algorithm,
//     Buffer.from(ENCRYPTION_KEY, "hex"),
//     Buffer.from(encryptedKey.iv, "hex")
//   );
//   const decrypted = Buffer.concat([
//     decipher.update(Buffer.from(encryptedKey.encryptedData, "hex")),
//     decipher.final(),
//   ]);

//   return decrypted.toString();
// }

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

    // //if APIKey already present, return without generating a new one
    if (user && user.name == "DashcamSG") {
      console.log("Just for DashcamSG hardcode LOL");
      return res
        .status(200)
        .json({ apiKey: "Okf7jdFrPTPtEUwL7eeeaggt2noUhq1GmSbQyRGbkp8=" });
    }
    const apiKey = generateKey();
    const encryptedSecret = generateHash(apiKey);

    const userUpdate = `https://friday-backend-server.herokuapp.com/userUpdate?uid=${uid}`;

    await axios
      .post(userUpdate, {
        APIKey: encryptedSecret,
      })
      .then(function (response) {})
      .catch(function (error) {
        console.log(error);
      });

    res.status(200).json({ apiKey });
  } catch (error) {
    console.error("Error retrieving items:", error.message);
  }
}
