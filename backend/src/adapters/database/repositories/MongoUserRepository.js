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

  async findById(id) {
    const document = await UserModel.findById(id).lean();

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

  async update(id, user) {
    const updateData = {};
    
    if (user.email !== undefined) {
      updateData.email = user.email;
    }
    
    if (user.password !== undefined) {
      updateData.passwordHash = user.password;
    }

    const document = await UserModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    if (!document) {
      return null;
    }

    return mapDocumentToUser(document);
  },

  async deleteById(id) {
    const result = await UserModel.findByIdAndDelete(id);
    return result ? mapDocumentToUser(result) : null;
  },
});

module.exports = createMongoUserRepository;
