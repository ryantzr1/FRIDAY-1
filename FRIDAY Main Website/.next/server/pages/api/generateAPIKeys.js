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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! crypto */ \"crypto\");\n/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);\n\nconst mongoose = __webpack_require__(/*! mongoose */ \"mongoose\");\nconst axios = __webpack_require__(/*! axios */ \"axios\");\n(__webpack_require__(/*! dotenv */ \"dotenv\").config)();\nmongoose.connect(process.env.MONGODB_URL, {\n    useNewUrlParser: true\n});\n//Generate API Key for customers\nfunction generateKey(size = 32, format = \"base64\") {\n    const buffer = crypto__WEBPACK_IMPORTED_MODULE_0___default().randomBytes(size);\n    return buffer.toString(format);\n}\n//Generate Secret Hash that we store in our MongoDB\nfunction generateHash(key) {\n    return crypto__WEBPACK_IMPORTED_MODULE_0___default().createHash(\"sha256\").update(key).digest(\"hex\");\n}\n// function encryptKey(key) {\n//   const iv = crypto.randomBytes(16);\n//   const cipher = crypto.createCipheriv(\n//     algorithm,\n//     Buffer.from(ENCRYPTION_KEY, \"hex\"),\n//     iv\n//   );\n//   const encrypted = Buffer.concat([cipher.update(key), cipher.final()]);\n//   return {\n//     iv: iv.toString(\"hex\"),\n//     encryptedData: encrypted.toString(\"hex\"),\n//   };\n// }\n// function decryptKey(encryptedKey) {\n//   const decipher = crypto.createDecipheriv(\n//     algorithm,\n//     Buffer.from(ENCRYPTION_KEY, \"hex\"),\n//     Buffer.from(encryptedKey.iv, \"hex\")\n//   );\n//   const decrypted = Buffer.concat([\n//     decipher.update(Buffer.from(encryptedKey.encryptedData, \"hex\")),\n//     decipher.final(),\n//   ]);\n//   return decrypted.toString();\n// }\nasync function handler(req, res) {\n    // Extract uid from the query parameters\n    const { uid  } = req.query;\n    try {\n        async function getUserInfo(uid) {\n            const response = await axios.get(`https://friday-backend-server.herokuapp.com/userInfo?uid=${uid}`);\n            const user = response.data;\n            return user;\n        }\n        const user = await getUserInfo(uid);\n        // //if APIKey already present, return without generating a new one\n        if (user && user.name == \"DashcamSG\") {\n            console.log(\"Just for DashcamSG hardcode LOL\");\n            return res.status(200).json({\n                apiKey: \"Okf7jdFrPTPtEUwL7eeeaggt2noUhq1GmSbQyRGbkp8=\"\n            });\n        }\n        const apiKey = generateKey();\n        const encryptedSecret = generateHash(apiKey);\n        console.log(encryptedSecret);\n        const userUpdate = `https://friday-backend-server.herokuapp.com/userUpdate?uid=${uid}`;\n        await axios.post(userUpdate, {\n            APIKey: encryptedSecret\n        }).then(function(response) {}).catch(function(error) {\n            console.log(error);\n        });\n        res.status(200).json({\n            apiKey\n        });\n    } catch (error) {\n        console.error(\"Error retrieving items:\", error.message);\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9zcmMvcGFnZXMvYXBpL2dlbmVyYXRlQVBJS2V5cy5qcy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBNEI7QUFDNUIsTUFBTUMsV0FBV0MsbUJBQU9BLENBQUMsMEJBQVU7QUFDbkMsTUFBTUMsUUFBUUQsbUJBQU9BLENBQUMsb0JBQU87QUFDN0JBLG9EQUF3QjtBQUV4QkQsU0FBU0ksT0FBTyxDQUFDQyxRQUFRQyxHQUFHLENBQUNDLFdBQVcsRUFBRTtJQUFFQyxpQkFBaUIsSUFBSTtBQUFDO0FBRWxFLGdDQUFnQztBQUNoQyxTQUFTQyxZQUFZQyxPQUFPLEVBQUUsRUFBRUMsU0FBUyxRQUFRLEVBQUU7SUFDakQsTUFBTUMsU0FBU2IseURBQWtCLENBQUNXO0lBQ2xDLE9BQU9FLE9BQU9FLFFBQVEsQ0FBQ0g7QUFDekI7QUFFQSxtREFBbUQ7QUFDbkQsU0FBU0ksYUFBYUMsR0FBRyxFQUFFO0lBQ3pCLE9BQU9qQix3REFBaUIsQ0FBQyxVQUFVbUIsTUFBTSxDQUFDRixLQUFLRyxNQUFNLENBQUM7QUFDeEQ7QUFFQSw2QkFBNkI7QUFDN0IsdUNBQXVDO0FBQ3ZDLDBDQUEwQztBQUMxQyxpQkFBaUI7QUFDakIsMENBQTBDO0FBQzFDLFNBQVM7QUFDVCxPQUFPO0FBQ1AsMkVBQTJFO0FBRTNFLGFBQWE7QUFDYiw4QkFBOEI7QUFDOUIsZ0RBQWdEO0FBQ2hELE9BQU87QUFDUCxJQUFJO0FBRUosc0NBQXNDO0FBQ3RDLDhDQUE4QztBQUM5QyxpQkFBaUI7QUFDakIsMENBQTBDO0FBQzFDLDBDQUEwQztBQUMxQyxPQUFPO0FBQ1Asc0NBQXNDO0FBQ3RDLHVFQUF1RTtBQUN2RSx3QkFBd0I7QUFDeEIsUUFBUTtBQUVSLGlDQUFpQztBQUNqQyxJQUFJO0FBRVcsZUFBZUMsUUFBUUMsR0FBRyxFQUFFQyxHQUFHLEVBQUU7SUFDOUMsd0NBQXdDO0lBQ3hDLE1BQU0sRUFBRUMsSUFBRyxFQUFFLEdBQUdGLElBQUlHLEtBQUs7SUFFekIsSUFBSTtRQUNGLGVBQWVDLFlBQVlGLEdBQUcsRUFBRTtZQUM5QixNQUFNRyxXQUFXLE1BQU14QixNQUFNeUIsR0FBRyxDQUM5QixDQUFDLHlEQUF5RCxFQUFFSixJQUFJLENBQUM7WUFFbkUsTUFBTUssT0FBT0YsU0FBU0csSUFBSTtZQUMxQixPQUFPRDtRQUNUO1FBRUEsTUFBTUEsT0FBTyxNQUFNSCxZQUFZRjtRQUUvQixtRUFBbUU7UUFDbkUsSUFBSUssUUFBUUEsS0FBS0UsSUFBSSxJQUFJLGFBQWE7WUFDcENDLFFBQVFDLEdBQUcsQ0FBQztZQUNaLE9BQU9WLElBQ0pXLE1BQU0sQ0FBQyxLQUNQQyxJQUFJLENBQUM7Z0JBQUVDLFFBQVE7WUFBK0M7UUFDbkUsQ0FBQztRQUVELE1BQU1BLFNBQVMxQjtRQUNmLE1BQU0yQixrQkFBa0JyQixhQUFhb0I7UUFFckNKLFFBQVFDLEdBQUcsQ0FBQ0k7UUFFWixNQUFNQyxhQUFhLENBQUMsMkRBQTJELEVBQUVkLElBQUksQ0FBQztRQUV0RixNQUFNckIsTUFDSG9DLElBQUksQ0FBQ0QsWUFBWTtZQUNoQkUsUUFBUUg7UUFDVixHQUNDSSxJQUFJLENBQUMsU0FBVWQsUUFBUSxFQUFFLENBQUMsR0FDMUJlLEtBQUssQ0FBQyxTQUFVQyxLQUFLLEVBQUU7WUFDdEJYLFFBQVFDLEdBQUcsQ0FBQ1U7UUFDZDtRQUVGcEIsSUFBSVcsTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztZQUFFQztRQUFPO0lBQ2hDLEVBQUUsT0FBT08sT0FBTztRQUNkWCxRQUFRVyxLQUFLLENBQUMsMkJBQTJCQSxNQUFNQyxPQUFPO0lBQ3hEO0FBQ0YsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2ZyaWRheXdlYnNpdGUvLi9zcmMvcGFnZXMvYXBpL2dlbmVyYXRlQVBJS2V5cy5qcz9lMWM4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjcnlwdG8gZnJvbSBcImNyeXB0b1wiO1xuY29uc3QgbW9uZ29vc2UgPSByZXF1aXJlKFwibW9uZ29vc2VcIik7XG5jb25zdCBheGlvcyA9IHJlcXVpcmUoXCJheGlvc1wiKTtcbnJlcXVpcmUoXCJkb3RlbnZcIikuY29uZmlnKCk7XG5cbm1vbmdvb3NlLmNvbm5lY3QocHJvY2Vzcy5lbnYuTU9OR09EQl9VUkwsIHsgdXNlTmV3VXJsUGFyc2VyOiB0cnVlIH0pO1xuXG4vL0dlbmVyYXRlIEFQSSBLZXkgZm9yIGN1c3RvbWVyc1xuZnVuY3Rpb24gZ2VuZXJhdGVLZXkoc2l6ZSA9IDMyLCBmb3JtYXQgPSBcImJhc2U2NFwiKSB7XG4gIGNvbnN0IGJ1ZmZlciA9IGNyeXB0by5yYW5kb21CeXRlcyhzaXplKTtcbiAgcmV0dXJuIGJ1ZmZlci50b1N0cmluZyhmb3JtYXQpO1xufVxuXG4vL0dlbmVyYXRlIFNlY3JldCBIYXNoIHRoYXQgd2Ugc3RvcmUgaW4gb3VyIE1vbmdvREJcbmZ1bmN0aW9uIGdlbmVyYXRlSGFzaChrZXkpIHtcbiAgcmV0dXJuIGNyeXB0by5jcmVhdGVIYXNoKFwic2hhMjU2XCIpLnVwZGF0ZShrZXkpLmRpZ2VzdChcImhleFwiKTtcbn1cblxuLy8gZnVuY3Rpb24gZW5jcnlwdEtleShrZXkpIHtcbi8vICAgY29uc3QgaXYgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoMTYpO1xuLy8gICBjb25zdCBjaXBoZXIgPSBjcnlwdG8uY3JlYXRlQ2lwaGVyaXYoXG4vLyAgICAgYWxnb3JpdGhtLFxuLy8gICAgIEJ1ZmZlci5mcm9tKEVOQ1JZUFRJT05fS0VZLCBcImhleFwiKSxcbi8vICAgICBpdlxuLy8gICApO1xuLy8gICBjb25zdCBlbmNyeXB0ZWQgPSBCdWZmZXIuY29uY2F0KFtjaXBoZXIudXBkYXRlKGtleSksIGNpcGhlci5maW5hbCgpXSk7XG5cbi8vICAgcmV0dXJuIHtcbi8vICAgICBpdjogaXYudG9TdHJpbmcoXCJoZXhcIiksXG4vLyAgICAgZW5jcnlwdGVkRGF0YTogZW5jcnlwdGVkLnRvU3RyaW5nKFwiaGV4XCIpLFxuLy8gICB9O1xuLy8gfVxuXG4vLyBmdW5jdGlvbiBkZWNyeXB0S2V5KGVuY3J5cHRlZEtleSkge1xuLy8gICBjb25zdCBkZWNpcGhlciA9IGNyeXB0by5jcmVhdGVEZWNpcGhlcml2KFxuLy8gICAgIGFsZ29yaXRobSxcbi8vICAgICBCdWZmZXIuZnJvbShFTkNSWVBUSU9OX0tFWSwgXCJoZXhcIiksXG4vLyAgICAgQnVmZmVyLmZyb20oZW5jcnlwdGVkS2V5Lml2LCBcImhleFwiKVxuLy8gICApO1xuLy8gICBjb25zdCBkZWNyeXB0ZWQgPSBCdWZmZXIuY29uY2F0KFtcbi8vICAgICBkZWNpcGhlci51cGRhdGUoQnVmZmVyLmZyb20oZW5jcnlwdGVkS2V5LmVuY3J5cHRlZERhdGEsIFwiaGV4XCIpKSxcbi8vICAgICBkZWNpcGhlci5maW5hbCgpLFxuLy8gICBdKTtcblxuLy8gICByZXR1cm4gZGVjcnlwdGVkLnRvU3RyaW5nKCk7XG4vLyB9XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMpIHtcbiAgLy8gRXh0cmFjdCB1aWQgZnJvbSB0aGUgcXVlcnkgcGFyYW1ldGVyc1xuICBjb25zdCB7IHVpZCB9ID0gcmVxLnF1ZXJ5O1xuXG4gIHRyeSB7XG4gICAgYXN5bmMgZnVuY3Rpb24gZ2V0VXNlckluZm8odWlkKSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldChcbiAgICAgICAgYGh0dHBzOi8vZnJpZGF5LWJhY2tlbmQtc2VydmVyLmhlcm9rdWFwcC5jb20vdXNlckluZm8/dWlkPSR7dWlkfWBcbiAgICAgICk7XG4gICAgICBjb25zdCB1c2VyID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgIHJldHVybiB1c2VyO1xuICAgIH1cblxuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBnZXRVc2VySW5mbyh1aWQpO1xuXG4gICAgLy8gLy9pZiBBUElLZXkgYWxyZWFkeSBwcmVzZW50LCByZXR1cm4gd2l0aG91dCBnZW5lcmF0aW5nIGEgbmV3IG9uZVxuICAgIGlmICh1c2VyICYmIHVzZXIubmFtZSA9PSBcIkRhc2hjYW1TR1wiKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkp1c3QgZm9yIERhc2hjYW1TRyBoYXJkY29kZSBMT0xcIik7XG4gICAgICByZXR1cm4gcmVzXG4gICAgICAgIC5zdGF0dXMoMjAwKVxuICAgICAgICAuanNvbih7IGFwaUtleTogXCJPa2Y3amRGclBUUHRFVXdMN2VlZWFnZ3Qybm9VaHExR21TYlF5Ukdia3A4PVwiIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGFwaUtleSA9IGdlbmVyYXRlS2V5KCk7XG4gICAgY29uc3QgZW5jcnlwdGVkU2VjcmV0ID0gZ2VuZXJhdGVIYXNoKGFwaUtleSk7XG5cbiAgICBjb25zb2xlLmxvZyhlbmNyeXB0ZWRTZWNyZXQpO1xuXG4gICAgY29uc3QgdXNlclVwZGF0ZSA9IGBodHRwczovL2ZyaWRheS1iYWNrZW5kLXNlcnZlci5oZXJva3VhcHAuY29tL3VzZXJVcGRhdGU/dWlkPSR7dWlkfWA7XG5cbiAgICBhd2FpdCBheGlvc1xuICAgICAgLnBvc3QodXNlclVwZGF0ZSwge1xuICAgICAgICBBUElLZXk6IGVuY3J5cHRlZFNlY3JldCxcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHt9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICB9KTtcblxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgYXBpS2V5IH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciByZXRyaWV2aW5nIGl0ZW1zOlwiLCBlcnJvci5tZXNzYWdlKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbImNyeXB0byIsIm1vbmdvb3NlIiwicmVxdWlyZSIsImF4aW9zIiwiY29uZmlnIiwiY29ubmVjdCIsInByb2Nlc3MiLCJlbnYiLCJNT05HT0RCX1VSTCIsInVzZU5ld1VybFBhcnNlciIsImdlbmVyYXRlS2V5Iiwic2l6ZSIsImZvcm1hdCIsImJ1ZmZlciIsInJhbmRvbUJ5dGVzIiwidG9TdHJpbmciLCJnZW5lcmF0ZUhhc2giLCJrZXkiLCJjcmVhdGVIYXNoIiwidXBkYXRlIiwiZGlnZXN0IiwiaGFuZGxlciIsInJlcSIsInJlcyIsInVpZCIsInF1ZXJ5IiwiZ2V0VXNlckluZm8iLCJyZXNwb25zZSIsImdldCIsInVzZXIiLCJkYXRhIiwibmFtZSIsImNvbnNvbGUiLCJsb2ciLCJzdGF0dXMiLCJqc29uIiwiYXBpS2V5IiwiZW5jcnlwdGVkU2VjcmV0IiwidXNlclVwZGF0ZSIsInBvc3QiLCJBUElLZXkiLCJ0aGVuIiwiY2F0Y2giLCJlcnJvciIsIm1lc3NhZ2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./src/pages/api/generateAPIKeys.js\n");

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