const ServerGenerator = {
  /**
   * Generate backend/src/server.js with Express setup and dynamic routes
   * 
   * Example output for classes ['Order', 'Product']:
   * 
   * // Import routes
   * const OrderRoutes = require('./routes/OrderRoutes');
   * const ProductRoutes = require('./routes/ProductRoutes');
   * 
   * // Mount generated routes
   * app.use('/api/order', OrderRoutes);
   * app.use('/api/product', ProductRoutes);
   * 
   * @param {Array} classes - Array of class definitions with name property
   * @returns {string} Generated server.js content with all imports and route mounting
   */
  generate: (classes = []) => {
    const classNames = classes.map(cls => cls.name);
    
    // Generate imports for auth routes (always included)
    const authRouteImport = `const authRoutes = require('./routes/authRoutes');`;
    
    // Generate imports for class routes (PascalCase class names)
    const classRouteImports = classNames.length > 0
      ? classNames
          .map(name => `const ${name}Routes = require('./routes/${name}Routes');`)
          .join('\n')
      : '// No class routes to import';

    const routeImports = `${authRouteImport}${classRouteImports ? '\n' + classRouteImports : ''}`;

    // Generate route mounting (kebab-case paths)
    // Auth routes are mounted first (public routes)
    const authRouteMounting = `app.use('/api/auth', authRoutes);`;
    
    const classRouteMounting = classNames.length > 0
      ? classNames
          .map(name => {
            const kebabName = name
              .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
              .toLowerCase();
            return `app.use('/api/${kebabName}', ${name}Routes);`;
          })
          .join('\n')
      : '// No class routes to mount';

    const routeMounting = `${authRouteMounting}${classRouteMounting ? '\n' + classRouteMounting : ''}`;

    const server = `require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
${routeImports}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend is running',
  });
});

// Mount generated routes
${routeMounting}

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`✓ Server running on http://localhost:\${PORT}\`);
});

module.exports = app;
`;

    return server;
  },
};

module.exports = ServerGenerator;
