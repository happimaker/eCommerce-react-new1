const fs = require('fs');
const LocalStrategy = require('passport-local');

const { USERS_PATH } = process.env;
const path = USERS_PATH || '/var/users.json';

let users = {};
if (USERS_PATH || fs.existsSync(path)) {
  const contents = fs.readFileSync(path);
  users = JSON.parse(contents);
}

module.exports = new LocalStrategy((username, suppliedPassword, done) => {
  if (Object.hasOwnProperty.call(users, username)) {
    const { password, groups } = users[username];
    if (password === suppliedPassword) {
      return done(null, { username, groups });
    }
  }

  return done(null, false);
});
