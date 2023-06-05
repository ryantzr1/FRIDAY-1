"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/generateAPIKeys";
exports.ids = ["pages/api/generateAPIKeys"];
exports.modules = {

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

module.exports = require("axios");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "(api)/./src/pages/api/generateAPIKeys.js":
/*!******************************************!*\
  !*** ./src/pages/api/generateAPIKeys.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! crypto */ \"crypto\");\n/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);\n\nconst mongoose = __webpack_require__(/*! mongoose */ \"mongoose\");\nconst axios = __webpack_require__(/*! axios */ \"axios\");\n(__webpack_require__(/*! dotenv */ \"dotenv\").config)();\nmongoose.connect(process.env.MONGODB_URL, {\n    useNewUrlParser: true\n});\n//Generate API Key for customers\n// function generateKey(size = 32, format = \"base64\") {\n//   const buffer = crypto.randomBytes(size);\n//   return buffer.toString(format);\n// }\n//Generate Secret Hash that we store in our MongoDB\nfunction generateHash(key) {\n    return crypto__WEBPACK_IMPORTED_MODULE_0___default().createHash(\"sha256\").update(key).digest(\"hex\");\n}\n// function encryptKey(key) {\n//   const iv = crypto.randomBytes(16);\n//   const cipher = crypto.createCipheriv(\n//     algorithm,\n//     Buffer.from(ENCRYPTION_KEY, \"hex\"),\n//     iv\n//   );\n//   const encrypted = Buffer.concat([cipher.update(key), cipher.final()]);\n//   return {\n//     iv: iv.toString(\"hex\"),\n//     encryptedData: encrypted.toString(\"hex\"),\n//   };\n// }\n// function decryptKey(encryptedKey) {\n//   const decipher = crypto.createDecipheriv(\n//     algorithm,\n//     Buffer.from(ENCRYPTION_KEY, \"hex\"),\n//     Buffer.from(encryptedKey.iv, \"hex\")\n//   );\n//   const decrypted = Buffer.concat([\n//     decipher.update(Buffer.from(encryptedKey.encryptedData, \"hex\")),\n//     decipher.final(),\n//   ]);\n//   return decrypted.toString();\n// }\nasync function handler(req, res) {\n    // Extract uid from the query parameters\n    const { uid  } = req.query;\n    try {\n        async function getUserInfo(uid) {\n            const response = await axios.get(`https://friday-backend-server.herokuapp.com/userInfo?uid=${uid}`);\n            const user = response.data;\n            return user;\n        }\n        const user = await getUserInfo(uid);\n        // //if APIKey already present, return without generating a new one\n        if (user && user.name == \"FRIDAY\") {\n            console.log(\"Just for DashcamSG hardcode LOL\");\n            const encryptedSecret = generateHash(\"Okf7jdFrPTPtEUwL7eeeaggt2noUhq1GmSbQyRGbkp8=\");\n            console.log(encryptedSecret);\n            return res.status(200).json({\n                apiKey: \"Okf7jdFrPTPtEUwL7eeeaggt2noUhq1GmSbQyRGbkp8=\"\n            });\n        }\n        const apiKey = generateKey();\n        const encryptedSecret = generateHash(apiKey);\n        const userUpdate = `https://friday-backend-server.herokuapp.com/userUpdate?uid=${uid}`;\n        await axios.post(userUpdate, {\n            APIKey: encryptedSecret\n        }).then(function(response) {}).catch(function(error) {\n            console.log(error);\n        });\n        res.status(200).json({\n            apiKey\n        });\n    } catch (error) {\n        console.error(\"Error retrieving items:\", error.message);\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9zcmMvcGFnZXMvYXBpL2dlbmVyYXRlQVBJS2V5cy5qcy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBNEI7QUFDNUIsTUFBTUMsV0FBV0MsbUJBQU9BLENBQUMsMEJBQVU7QUFDbkMsTUFBTUMsUUFBUUQsbUJBQU9BLENBQUMsb0JBQU87QUFDN0JBLG9EQUF3QjtBQUV4QkQsU0FBU0ksT0FBTyxDQUFDQyxRQUFRQyxHQUFHLENBQUNDLFdBQVcsRUFBRTtJQUFFQyxpQkFBaUIsSUFBSTtBQUFDO0FBRWxFLGdDQUFnQztBQUNoQyx1REFBdUQ7QUFDdkQsNkNBQTZDO0FBQzdDLG9DQUFvQztBQUNwQyxJQUFJO0FBRUosbURBQW1EO0FBQ25ELFNBQVNDLGFBQWFDLEdBQUcsRUFBRTtJQUN6QixPQUFPWCx3REFBaUIsQ0FBQyxVQUFVYSxNQUFNLENBQUNGLEtBQUtHLE1BQU0sQ0FBQztBQUN4RDtBQUVBLDZCQUE2QjtBQUM3Qix1Q0FBdUM7QUFDdkMsMENBQTBDO0FBQzFDLGlCQUFpQjtBQUNqQiwwQ0FBMEM7QUFDMUMsU0FBUztBQUNULE9BQU87QUFDUCwyRUFBMkU7QUFFM0UsYUFBYTtBQUNiLDhCQUE4QjtBQUM5QixnREFBZ0Q7QUFDaEQsT0FBTztBQUNQLElBQUk7QUFFSixzQ0FBc0M7QUFDdEMsOENBQThDO0FBQzlDLGlCQUFpQjtBQUNqQiwwQ0FBMEM7QUFDMUMsMENBQTBDO0FBQzFDLE9BQU87QUFDUCxzQ0FBc0M7QUFDdEMsdUVBQXVFO0FBQ3ZFLHdCQUF3QjtBQUN4QixRQUFRO0FBRVIsaUNBQWlDO0FBQ2pDLElBQUk7QUFFVyxlQUFlQyxRQUFRQyxHQUFHLEVBQUVDLEdBQUcsRUFBRTtJQUM5Qyx3Q0FBd0M7SUFDeEMsTUFBTSxFQUFFQyxJQUFHLEVBQUUsR0FBR0YsSUFBSUcsS0FBSztJQUV6QixJQUFJO1FBQ0YsZUFBZUMsWUFBWUYsR0FBRyxFQUFFO1lBQzlCLE1BQU1HLFdBQVcsTUFBTWxCLE1BQU1tQixHQUFHLENBQzlCLENBQUMseURBQXlELEVBQUVKLElBQUksQ0FBQztZQUVuRSxNQUFNSyxPQUFPRixTQUFTRyxJQUFJO1lBQzFCLE9BQU9EO1FBQ1Q7UUFFQSxNQUFNQSxPQUFPLE1BQU1ILFlBQVlGO1FBRS9CLG1FQUFtRTtRQUNuRSxJQUFJSyxRQUFRQSxLQUFLRSxJQUFJLElBQUksVUFBVTtZQUNqQ0MsUUFBUUMsR0FBRyxDQUFDO1lBQ1osTUFBTUMsa0JBQWtCbEIsYUFDdEI7WUFFRmdCLFFBQVFDLEdBQUcsQ0FBQ0M7WUFFWixPQUFPWCxJQUNKWSxNQUFNLENBQUMsS0FDUEMsSUFBSSxDQUFDO2dCQUFFQyxRQUFRO1lBQStDO1FBQ25FLENBQUM7UUFDRCxNQUFNQSxTQUFTQztRQUNmLE1BQU1KLGtCQUFrQmxCLGFBQWFxQjtRQUVyQyxNQUFNRSxhQUFhLENBQUMsMkRBQTJELEVBQUVmLElBQUksQ0FBQztRQUV0RixNQUFNZixNQUNIK0IsSUFBSSxDQUFDRCxZQUFZO1lBQ2hCRSxRQUFRUDtRQUNWLEdBQ0NRLElBQUksQ0FBQyxTQUFVZixRQUFRLEVBQUUsQ0FBQyxHQUMxQmdCLEtBQUssQ0FBQyxTQUFVQyxLQUFLLEVBQUU7WUFDdEJaLFFBQVFDLEdBQUcsQ0FBQ1c7UUFDZDtRQUVGckIsSUFBSVksTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztZQUFFQztRQUFPO0lBQ2hDLEVBQUUsT0FBT08sT0FBTztRQUNkWixRQUFRWSxLQUFLLENBQUMsMkJBQTJCQSxNQUFNQyxPQUFPO0lBQ3hEO0FBQ0YsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2ZyaWRheXdlYnNpdGUvLi9zcmMvcGFnZXMvYXBpL2dlbmVyYXRlQVBJS2V5cy5qcz9lMWM4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjcnlwdG8gZnJvbSBcImNyeXB0b1wiO1xuY29uc3QgbW9uZ29vc2UgPSByZXF1aXJlKFwibW9uZ29vc2VcIik7XG5jb25zdCBheGlvcyA9IHJlcXVpcmUoXCJheGlvc1wiKTtcbnJlcXVpcmUoXCJkb3RlbnZcIikuY29uZmlnKCk7XG5cbm1vbmdvb3NlLmNvbm5lY3QocHJvY2Vzcy5lbnYuTU9OR09EQl9VUkwsIHsgdXNlTmV3VXJsUGFyc2VyOiB0cnVlIH0pO1xuXG4vL0dlbmVyYXRlIEFQSSBLZXkgZm9yIGN1c3RvbWVyc1xuLy8gZnVuY3Rpb24gZ2VuZXJhdGVLZXkoc2l6ZSA9IDMyLCBmb3JtYXQgPSBcImJhc2U2NFwiKSB7XG4vLyAgIGNvbnN0IGJ1ZmZlciA9IGNyeXB0by5yYW5kb21CeXRlcyhzaXplKTtcbi8vICAgcmV0dXJuIGJ1ZmZlci50b1N0cmluZyhmb3JtYXQpO1xuLy8gfVxuXG4vL0dlbmVyYXRlIFNlY3JldCBIYXNoIHRoYXQgd2Ugc3RvcmUgaW4gb3VyIE1vbmdvREJcbmZ1bmN0aW9uIGdlbmVyYXRlSGFzaChrZXkpIHtcbiAgcmV0dXJuIGNyeXB0by5jcmVhdGVIYXNoKFwic2hhMjU2XCIpLnVwZGF0ZShrZXkpLmRpZ2VzdChcImhleFwiKTtcbn1cblxuLy8gZnVuY3Rpb24gZW5jcnlwdEtleShrZXkpIHtcbi8vICAgY29uc3QgaXYgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoMTYpO1xuLy8gICBjb25zdCBjaXBoZXIgPSBjcnlwdG8uY3JlYXRlQ2lwaGVyaXYoXG4vLyAgICAgYWxnb3JpdGhtLFxuLy8gICAgIEJ1ZmZlci5mcm9tKEVOQ1JZUFRJT05fS0VZLCBcImhleFwiKSxcbi8vICAgICBpdlxuLy8gICApO1xuLy8gICBjb25zdCBlbmNyeXB0ZWQgPSBCdWZmZXIuY29uY2F0KFtjaXBoZXIudXBkYXRlKGtleSksIGNpcGhlci5maW5hbCgpXSk7XG5cbi8vICAgcmV0dXJuIHtcbi8vICAgICBpdjogaXYudG9TdHJpbmcoXCJoZXhcIiksXG4vLyAgICAgZW5jcnlwdGVkRGF0YTogZW5jcnlwdGVkLnRvU3RyaW5nKFwiaGV4XCIpLFxuLy8gICB9O1xuLy8gfVxuXG4vLyBmdW5jdGlvbiBkZWNyeXB0S2V5KGVuY3J5cHRlZEtleSkge1xuLy8gICBjb25zdCBkZWNpcGhlciA9IGNyeXB0by5jcmVhdGVEZWNpcGhlcml2KFxuLy8gICAgIGFsZ29yaXRobSxcbi8vICAgICBCdWZmZXIuZnJvbShFTkNSWVBUSU9OX0tFWSwgXCJoZXhcIiksXG4vLyAgICAgQnVmZmVyLmZyb20oZW5jcnlwdGVkS2V5Lml2LCBcImhleFwiKVxuLy8gICApO1xuLy8gICBjb25zdCBkZWNyeXB0ZWQgPSBCdWZmZXIuY29uY2F0KFtcbi8vICAgICBkZWNpcGhlci51cGRhdGUoQnVmZmVyLmZyb20oZW5jcnlwdGVkS2V5LmVuY3J5cHRlZERhdGEsIFwiaGV4XCIpKSxcbi8vICAgICBkZWNpcGhlci5maW5hbCgpLFxuLy8gICBdKTtcblxuLy8gICByZXR1cm4gZGVjcnlwdGVkLnRvU3RyaW5nKCk7XG4vLyB9XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMpIHtcbiAgLy8gRXh0cmFjdCB1aWQgZnJvbSB0aGUgcXVlcnkgcGFyYW1ldGVyc1xuICBjb25zdCB7IHVpZCB9ID0gcmVxLnF1ZXJ5O1xuXG4gIHRyeSB7XG4gICAgYXN5bmMgZnVuY3Rpb24gZ2V0VXNlckluZm8odWlkKSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldChcbiAgICAgICAgYGh0dHBzOi8vZnJpZGF5LWJhY2tlbmQtc2VydmVyLmhlcm9rdWFwcC5jb20vdXNlckluZm8/dWlkPSR7dWlkfWBcbiAgICAgICk7XG4gICAgICBjb25zdCB1c2VyID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgIHJldHVybiB1c2VyO1xuICAgIH1cblxuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBnZXRVc2VySW5mbyh1aWQpO1xuXG4gICAgLy8gLy9pZiBBUElLZXkgYWxyZWFkeSBwcmVzZW50LCByZXR1cm4gd2l0aG91dCBnZW5lcmF0aW5nIGEgbmV3IG9uZVxuICAgIGlmICh1c2VyICYmIHVzZXIubmFtZSA9PSBcIkZSSURBWVwiKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkp1c3QgZm9yIERhc2hjYW1TRyBoYXJkY29kZSBMT0xcIik7XG4gICAgICBjb25zdCBlbmNyeXB0ZWRTZWNyZXQgPSBnZW5lcmF0ZUhhc2goXG4gICAgICAgIFwiT2tmN2pkRnJQVFB0RVV3TDdlZWVhZ2d0Mm5vVWhxMUdtU2JReVJHYmtwOD1cIlxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKGVuY3J5cHRlZFNlY3JldCk7XG5cbiAgICAgIHJldHVybiByZXNcbiAgICAgICAgLnN0YXR1cygyMDApXG4gICAgICAgIC5qc29uKHsgYXBpS2V5OiBcIk9rZjdqZEZyUFRQdEVVd0w3ZWVlYWdndDJub1VocTFHbVNiUXlSR2JrcDg9XCIgfSk7XG4gICAgfVxuICAgIGNvbnN0IGFwaUtleSA9IGdlbmVyYXRlS2V5KCk7XG4gICAgY29uc3QgZW5jcnlwdGVkU2VjcmV0ID0gZ2VuZXJhdGVIYXNoKGFwaUtleSk7XG5cbiAgICBjb25zdCB1c2VyVXBkYXRlID0gYGh0dHBzOi8vZnJpZGF5LWJhY2tlbmQtc2VydmVyLmhlcm9rdWFwcC5jb20vdXNlclVwZGF0ZT91aWQ9JHt1aWR9YDtcblxuICAgIGF3YWl0IGF4aW9zXG4gICAgICAucG9zdCh1c2VyVXBkYXRlLCB7XG4gICAgICAgIEFQSUtleTogZW5jcnlwdGVkU2VjcmV0LFxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge30pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgIH0pO1xuXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBhcGlLZXkgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIHJldHJpZXZpbmcgaXRlbXM6XCIsIGVycm9yLm1lc3NhZ2UpO1xuICB9XG59XG4iXSwibmFtZXMiOlsiY3J5cHRvIiwibW9uZ29vc2UiLCJyZXF1aXJlIiwiYXhpb3MiLCJjb25maWciLCJjb25uZWN0IiwicHJvY2VzcyIsImVudiIsIk1PTkdPREJfVVJMIiwidXNlTmV3VXJsUGFyc2VyIiwiZ2VuZXJhdGVIYXNoIiwia2V5IiwiY3JlYXRlSGFzaCIsInVwZGF0ZSIsImRpZ2VzdCIsImhhbmRsZXIiLCJyZXEiLCJyZXMiLCJ1aWQiLCJxdWVyeSIsImdldFVzZXJJbmZvIiwicmVzcG9uc2UiLCJnZXQiLCJ1c2VyIiwiZGF0YSIsIm5hbWUiLCJjb25zb2xlIiwibG9nIiwiZW5jcnlwdGVkU2VjcmV0Iiwic3RhdHVzIiwianNvbiIsImFwaUtleSIsImdlbmVyYXRlS2V5IiwidXNlclVwZGF0ZSIsInBvc3QiLCJBUElLZXkiLCJ0aGVuIiwiY2F0Y2giLCJlcnJvciIsIm1lc3NhZ2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./src/pages/api/generateAPIKeys.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(api)/./src/pages/api/generateAPIKeys.js"));
module.exports = __webpack_exports__;

})();