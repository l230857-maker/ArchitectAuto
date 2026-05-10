const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error('MONGO_URI is missing in the environment configuration');
  }

  await mongoose.connect(mongoUri);
};

module.exports = connectDB;
