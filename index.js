const express = require("express"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  LdapStrategy = require("passport-ldapauth"),
  redis = require("redis"),
  uuid = require("uuid"),
  dotenv = require("dotenv");

dotenv.config();

const { LDAP_CREDENTIALS, LDAP_BIND, LDAP_URL, REDIS_HOST } = process.env;

const OPTS = {
  server: {
    url: LDAP_URL,
    bindDN: LDAP_BIND,
    bindCredentials: LDAP_CREDENTIALS,
    searchBase: "CN=Users,DC=maxlab,DC=lu,DC=se",
    searchFilter: "(sAMAccountName={{username}})"
  }
};

const redisClient = redis.createClient(6379, REDIS_HOST);

const app = express();

passport.use(new LdapStrategy(OPTS));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

app.post(
  "/login",
  passport.authenticate("ldapauth", { session: false }),
  (req, res) => {
    const username = req.body.username;
    const token = uuid.v4();

    redisClient.set(token, username, err => {
      if (err) {
        res.sendStatus(500);
        return;
      }

      res.cookie("token", token);
      res.sendStatus(200);
    });
  }
);

app.post("/logout", (req, res) => {
  const token = req.cookies.token;
  if (token == null) {
    res.sendStatus(400);
    return;
  }

  redisClient.del(token, err => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.sendStatus(200);
    }
  });
});

app.listen(8080);
