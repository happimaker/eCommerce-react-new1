const LdapStrategy = require('passport-ldapauth');

const { LDAP_CREDENTIALS, LDAP_BIND, LDAP_URL } = process.env;

function unique(arr) {
  return arr.filter((elem, i) => arr.indexOf(elem) === i);
}

const OPTS = {
  server: {
    url: LDAP_URL,
    bindDN: LDAP_BIND,
    bindCredentials: LDAP_CREDENTIALS,
    searchBase: 'CN=Users,DC=maxlab,DC=lu,DC=se', // TODO: make configurable
    searchFilter: '(sAMAccountName={{username}})', // TODO: make configurable
  },
  passReqToCallback: true,
};

module.exports = new LdapStrategy(OPTS, (req, user, done) => {
  const { username } = req.body;
  let memberOf = user.memberOf || [];
   //funny thing here -- if the user only is a member of a single (1) group, 'memberOf' doesn't return a string
  //array of length 1, it just returns a string!
  if (!Array.isArray(memberOf)) {
    memberOf = [memberOf];
  }
  const groups = unique(
    memberOf
      .map((group) => group.split(','))
      .reduce((all, curr) => [...all, ...curr])
      .map((entry) => entry.split('='))
      .filter((pair) => pair[0] === 'CN')
      .map((pair) => pair[1]),
  );

  done(null, { username, groups });
});
