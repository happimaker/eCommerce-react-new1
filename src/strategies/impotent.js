const LocalStrategy = require("passport-local");

const USERNAME = "impotent";
const PASSWORD = "impotent";

module.exports = new LocalStrategy((username, password, done) => {
  if (username === USERNAME && password === PASSWORD) {
    done(null, { username, groups: [] });
  } else {
    done(null, false);
  }
});
