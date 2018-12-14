const express = require("express"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  LdapStrategy = require("passport-ldapauth"),
  dotenv = require("dotenv"),
  jsonwebtoken = require("jsonwebtoken");

dotenv.config();

function unique(arr) {
  return arr.filter((elem, i) => arr.indexOf(elem) === i);
}

function generateToken(username, groups) {
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

const { LDAP_CREDENTIALS, LDAP_BIND, LDAP_URL, SECRET } = process.env;

const EXPIRY_TIME = "1h";
const COOKIE_NAME = "webjive_jwt";

const OPTS = {
  server: {
    url: LDAP_URL,
    bindDN: LDAP_BIND,
    bindCredentials: LDAP_CREDENTIALS,
    searchBase: "CN=Users,DC=maxlab,DC=lu,DC=se",
    searchFilter: "(sAMAccountName={{username}})"
  }
};

passport.use(new LdapStrategy(OPTS));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

app.post(
  "/login",
  passport.authenticate("ldapauth", { session: false }),
  (req, res) => {
    const username = req.body.username;
    const memberOf = req.user.memberOf || [];
    const groups = unique(
      memberOf
        .map(group => group.split(","))
        .reduce((all, curr) => [...all, ...curr])
        .map(x => x.split("="))
        .filter(pair => pair[0] === "CN")
        .map(pair => pair[1])
    );

    const jwt = generateToken(username, groups);
    res.cookie(COOKIE_NAME, jwt).send();
  }
);

app.post("/renew", (req, res) => {
  const jwt = req.cookies[COOKIE_NAME];
  const renewed = extendToken(jwt);

  if (renewed == null) {
    res.sendStatus(403);
  } else {
    res.cookie(COOKIE_NAME, renewed).send();
  }
});

app.get("/user", (req, res) => {
  const token = req.cookies[COOKIE_NAME];
  const username = usernameFromToken(token);
  res.json(username && { username });
});

app.listen(8080);
