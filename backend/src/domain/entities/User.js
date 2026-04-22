const createUser = ({ id = null, email, passwordHash, createdAt = null, updatedAt = null }) => ({
  id,
  email,
  passwordHash,
  createdAt,
  updatedAt,
});

module.exports = createUser;
