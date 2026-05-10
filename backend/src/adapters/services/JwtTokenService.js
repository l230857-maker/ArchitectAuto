const jwt = require('jsonwebtoken');

const createJwtTokenService = (secret, expiresIn) => ({
  generate(payload) {
    return jwt.sign(payload, secret, { expiresIn });
  },

  verify(token) {
    return jwt.verify(token, secret);
  },
});

module.exports = createJwtTokenService;
