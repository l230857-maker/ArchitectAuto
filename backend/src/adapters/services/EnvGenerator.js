const EnvGenerator = {
  generate: () => {
    const files = [];

    try {
      // Generate backend .env.example
      const backendEnv = EnvGenerator.generateBackendEnv();
      files.push({
        path: 'backend/.env.example',
        content: backendEnv,
      });
    } catch (error) {
      console.error('Error generating backend .env.example:', error.message);
    }

    try {
      // Generate frontend .env.example
      const frontendEnv = EnvGenerator.generateFrontendEnv();
      files.push({
        path: 'frontend/.env.example',
        content: frontendEnv,
      });
    } catch (error) {
      console.error('Error generating frontend .env.example:', error.message);
    }

    return files;
  },

  generateBackendEnv: () => {
    return `# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/project-name

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=development
PORT=5000

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Bcrypt Configuration
BCRYPT_ROUNDS=10

# Email Configuration (optional - for password reset emails)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Logging (optional)
# LOG_LEVEL=debug
`;
  },

  generateFrontendEnv: () => {
    return `# API Server URL
VITE_API_URL=http://localhost:5000/api

# Environment
VITE_ENV=development

# API Timeout (milliseconds)
VITE_API_TIMEOUT=30000
`;
  },
};

module.exports = EnvGenerator;
