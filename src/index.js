const dotenv = require("dotenv");
dotenv.config();

const express = require("express"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  jsonwebtoken = require("jsonwebtoken");

function generateToken(username, groups) {
  if (username == null) {
    throw new Error("username musn't be null");
  }

  if (!Array.isArray(groups)) {
    throw new Error("groups must be an array");
  }

  const payload = { username, groups };
  return jsonwebtoken.sign(payload, SECRET, { expiresIn: EXPIRY_TIME });
}

function extendToken(jwt) {
  try {
    const { username, groups } = jsonwebtoken.verify(jwt, SECRET);
    return generateToken(username, groups);
  } catch (err) {
    return null;
  }
}

function usernameFromToken(jwt) {
  try {
    const { username } = jsonwebtoken.verify(jwt, SECRET);
    return username;
  } catch (err) {
    return null;
  }
}

const { SECRET, LDAP_URL, LDAP_BIND, LDAP_CREDENTIALS } = process.env;
const EXPIRY_TIME = "1h";
const COOKIE_NAME = "webjive_jwt";
const PORT = 8080;

const strategies = ["local.impotent", "local.file"];

const impotentStrategy = require("./strategies/impotent");
passport.use("local.impotent", impotentStrategy);

const fileStrategy = require("./strategies/file");
passport.use("local.file", fileStrategy);

if (LDAP_URL && LDAP_BIND && LDAP_CREDENTIALS) {
  const ldapStrategy = require("./strategies/ldap");
  passport.use(ldapStrategy);
  strategies.push("ldapauth");
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

const passportMiddleware = passport.authenticate(
  strategies,
  { session: false }
);

app.post("/login", passportMiddleware, (req, res) => {
  const { user } = req;
  if (user === null) {
    return res.sendStatus(400);
  }
  const { username, groups } = user;
  const jwt = generateToken(username, groups);
  res.cookie(COOKIE_NAME, jwt);
  res.json({webjive_jwt: jwt});
});

app.post("/extend", (req, res) => {
  const jwt = req.cookies[COOKIE_NAME];
  const extended = extendToken(jwt);

  if (extended == null) {
    res.clearCookie(COOKIE_NAME).sendStatus(403);
  } else {
    res.cookie(COOKIE_NAME, extended).send();
  }
});

app.post("/logout", (_, res) => {
  res.clearCookie(COOKIE_NAME).send();
});

app.get("/user", (req, res) => {
  const token = req.cookies[COOKIE_NAME];
  const username = usernameFromToken(token);
  res.json(username && { username });
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

process.on("SIGTERM", () => {
  server.close();
});

process.on("SIGINT", () => {
  server.close();
});
