const createUser = require('../../../domain/entities/User');
const UserModel = require('../models/UserModel');

const mapDocumentToUser = (document) => createUser({
  id: document._id.toString(),
  email: document.email,
  passwordHash: document.passwordHash,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
});

const createMongoUserRepository = () => ({
  async findByEmail(email) {
    const document = await UserModel.findOne({ email }).lean();

    if (!document) {
      return null;
    }

    return mapDocumentToUser(document);
  },

  async create(user) {
    const document = await UserModel.create({
      email: user.email,
      passwordHash: user.passwordHash,
    });

    return mapDocumentToUser(document);
  },
});

module.exports = createMongoUserRepository;
