const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

const users = [];
app.post("/signup", (req, res) => {
  const { userHandle, password } = req.body;
  if (
    typeof userHandle === "string" &&
    typeof password === "string" &&
    userHandle.length >= 6 &&
    password.length >= 6
  ) {
    users.push({ userHandle, password });
    return res.status(201).send("User registered successfully");
  }
  return res.status(400).send("Invalid request body");
});
const secretKey = "cacacaca";

app.post("/login", (req, res) => {
  const { userHandle, password } = req.body;
  if (
    typeof userHandle !== "string" ||
    typeof password !== "string" ||
    userHandle.trim().length < 6 ||
    password.trim().length < 6
  ) {
    return res.status(400).send("Invalid request body");
  }
  const mandatory_fields = ["userHandle", "password"];
  const invalid_fields = Object.keys(req.body).some(
    (key) => !mandatory_fields.includes(key)
  );
  if (invalid_fields) {
    return res.status(400).send("Request contains invalid fields");
  }
  const user = users.find(
    (item) => item.userHandle === userHandle && item.password === password
  );
  if (user) {
    const token = jwt.sign({ userHandle: user.userHandle }, secretKey, {
      expiresIn: "1h",
    });
    console.log("Token generated:", token);
    return res.status(200).json({ jsonWebToken: token });
  }
  return res.status(401).send("Unauthorized: Incorrect username or password");
});

// JWT token verification middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized, JWT token is missing");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized, JWT token is invalid");
  }
}

const highScores = [];

app.post("/high-scores", verifyToken, (req, res) => {
  const { level, userHandle, score, timestamp } = req.body;

  if (
    !level ||
    !userHandle ||
    !score ||
    !timestamp ||
    typeof level !== "string" ||
    typeof userHandle !== "string" ||
    typeof score !== "number" ||
    typeof timestamp !== "string"
  ) {
    return res.status(400).send("Invalid request body");
  }

  const highScore_data = { level, userHandle, score, timestamp };
  highScores.push(highScore_data);
  return res.status(201).send("High score posted successfully");
});

app.get("/high-scores", (req, res) => {
  const { level, page } = req.query;

  if (!level || typeof level !== "string") {
    return res.status(400).send("Invalid or missing 'level' query parameter");
  }

  const filteredScores = highScores.filter((score) => score.level === level);

  const sortedScores = filteredScores.sort((a, b) => b.score - a.score);

  const page_number = 20;
  const pageNumber = parseInt(page, 10) || 1;
  const startIndex = (pageNumber - 1) * page_number;
  const finalscores = sortedScores.slice(startIndex, startIndex + page_number);

  return res.status(200).json(finalscores);
});

//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
