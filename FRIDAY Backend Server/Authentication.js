//Authenticate API requests from customers
const crypto = require("crypto");

function generateKey(size = 32, format = "base64") {
  const buffer = crypto.randomBytes(size);
  return buffer.toString(format);
}

function generateSecretHash(key) {
  const salt = crypto.randomBytes(8).toString("hex");
  const buffer = crypto.scryptSync(key, salt, 64);
  return `${buffer.toString("hex")}.${salt}`;
}

// use the previous function
const key = generateKey();
const secretHash = generateSecretHash(key);

function compareKeys(storedKey, suppliedKey) {
  const [hashedPassword, salt] = storedKey.split(".");

  const buffer = crypto.scryptSync(suppliedKey, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hashedPassword, "hex"), buffer);
}

//authenticate the request
function authenticateRequest(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header provided" });
  }

  const authParts = authHeader.split(" ");

  if (authParts.length !== 2 || authParts[0].toLowerCase() !== "basic") {
    return res
      .status(401)
      .json({ error: "Invalid authorization header format" });
  }

  const [username, password] = Buffer.from(authParts[1], "base64")
    .toString()
    .split(":");

  if (username !== "apikey") {
    return res.status(401).json({ error: "Invalid username" });
  }

  const isValid = compareKeys(secretHash, password);

  if (!isValid) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  // If we reach this point, the API key is valid. Continue processing the request...
  next();
}
