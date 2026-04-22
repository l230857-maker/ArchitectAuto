const jwt = require('jsonwebtoken');

const createJwtTokenService = (secret, expiresIn) => ({
  generate(payload) {
    return jwt.sign(payload, secret, { expiresIn });
  },
});

module.exports = createJwtTokenService;
