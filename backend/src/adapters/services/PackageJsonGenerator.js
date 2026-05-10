const PackageJsonGenerator = {
  toKebabCase: (str) => {
    if (!str) return '';
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  },

  generate: (projectName) => {
    const files = [];

    try {
      // Generate backend package.json
      const backendPackageJson = PackageJsonGenerator.generateBackendPackageJson(projectName);
      files.push({
        path: 'backend/package.json',
        content: backendPackageJson,
      });
    } catch (error) {
      console.error('Error generating backend package.json:', error.message);
    }

    try {
      // Generate frontend package.json
      const frontendPackageJson = PackageJsonGenerator.generateFrontendPackageJson(projectName);
      files.push({
        path: 'frontend/package.json',
        content: frontendPackageJson,
      });
    } catch (error) {
      console.error('Error generating frontend package.json:', error.message);
    }

    return files;
  },

  generateBackendPackageJson: (projectName) => {
    const packageName = PackageJsonGenerator.toKebabCase(projectName);

    const packageJson = {
      name: packageName,
      version: '1.0.0',
      description: `Backend API for ${projectName}`,
      main: 'src/server.js',
      scripts: {
        start: 'node src/server.js',
        dev: 'nodemon src/server.js',
      },
      keywords: ['express', 'mongodb', 'mern', packageName],
      author: '',
      license: 'MIT',
      dependencies: {
        express: '^4.18.2',
        mongoose: '^7.5.0',
        jsonwebtoken: '^9.0.2',
        bcrypt: '^5.1.1',
        cors: '^2.8.5',
        dotenv: '^16.3.1',
      },
      devDependencies: {
        nodemon: '^3.0.1',
      },
    };

    return JSON.stringify(packageJson, null, 2);
  },

  generateFrontendPackageJson: (projectName) => {
    const packageName = `${PackageJsonGenerator.toKebabCase(projectName)}-client`;

    const packageJson = {
      name: packageName,
      private: true,
      version: '0.0.1',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.16.0',
        axios: '^1.5.0',
      },
      devDependencies: {
        '@types/react': '^18.2.15',
        '@types/react-dom': '^18.2.7',
        '@vitejs/plugin-react': '^4.0.11',
        vite: '^4.4.5',
      },
    };

    return JSON.stringify(packageJson, null, 2);
  },
};

module.exports = PackageJsonGenerator;
