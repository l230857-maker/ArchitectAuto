const bcrypt = require('bcryptjs');

const createBcryptPasswordService = () => ({
  hash(value) {
    return bcrypt.hash(value, 10);
  },

  compare(plainValue, hashedValue) {
    return bcrypt.compare(plainValue, hashedValue);
  },
});

module.exports = createBcryptPasswordService;
