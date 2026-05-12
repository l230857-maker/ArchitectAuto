const ReadmeGenerator = {
  toPascalCase: (name) => {
    if (!name) return '';
    return name
      .split(/[\s_-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  },

  toKebabCase: (name) => {
    if (!name) return '';
    return name
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  },

  generate: (projectName, classes, relationships = []) => {
    const content = ReadmeGenerator.generateReadmeContent(projectName, classes, relationships);
    return [{
      path: 'README.md',
      content,
    }];
  },

  generateReadmeContent: (projectName, classes, relationships = []) => {
    const timestamp = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const databaseName = ReadmeGenerator.toKebabCase(projectName);

    let readmeContent = `# ${projectName} - Generated Code

**Generated:** ${timestamp}  
**Classes:** ${classes.length}

---

## 📋 Table of Contents

1. [Quick Start Setup](#quick-start-setup)
2. [File Structure](#file-structure)
3. [Models](#models)
4. [API Endpoints](#api-endpoints)
5. [React Components](#react-components)
6. [Database Relationships](#database-relationships)
7. [Custom Methods](#custom-methods)
8. [Integration Instructions](#integration-instructions)
9. [Environment Variables](#environment-variables)
10. [Next Steps](#next-steps)

---

## 🚀 Quick Start Setup

### Step 1: Copy Files to Your Project

\`\`\`bash
# Copy generated files to your MERN project
cp -r models/* your-project/backend/src/models/
cp -r controllers/* your-project/backend/src/controllers/
cp -r routes/* your-project/backend/src/routes/
cp -r components/* your-project/frontend/src/components/
\`\`\`

### Step 2: Install Dependencies (if needed)

\`\`\`bash
# Backend
npm install mongoose express jsonwebtoken

# Frontend
npm install react prop-types
\`\`\`

### Step 3: Set Up Environment Variables

Create a \`.env\` file in your backend directory:

\`\`\`env
# JWT Configuration
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d

# Database
MONGO_URI=mongodb://localhost:27017/your-database-name

# Server
PORT=5000
NODE_ENV=development
\`\`\`

### Step 4: Configure Express with Request Size Limits

Add to your \`server.js\` before mounting routes:

\`\`\`javascript
const express = require('express');
const app = express();

// Configure request size limits (prevents DOS attacks)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
const ${ReadmeGenerator.toPascalCase(classes[0].name)}Routes = require('./routes/${ReadmeGenerator.toPascalCase(classes[0].name)}Routes');
${classes.slice(1).map((cls) => `const ${ReadmeGenerator.toPascalCase(cls.name)}Routes = require('./routes/${ReadmeGenerator.toPascalCase(cls.name)}Routes');`).join('\n')}

// Mount routes (authentication is handled automatically)
app.use('/api/${classes[0].name.toLowerCase()}', ${ReadmeGenerator.toPascalCase(classes[0].name)}Routes);
${classes.slice(1).map((cls) => `app.use('/api/${cls.name.toLowerCase()}', ${ReadmeGenerator.toPascalCase(cls.name)}Routes);`).join('\n')}
\`\`\`

**Note:** The 10mb limit can be adjusted based on your needs. This prevents denial-of-service attacks from excessively large payloads.

---

## 📁 File Structure

Generated files are organized as follows:

\`\`\`
generated-code/
├── models/
│   ├── User.js (Authentication - stores user accounts)
│   ${classes.map((cls) => `├── ${ReadmeGenerator.toPascalCase(cls.name)}.js`).join('\n   ')}
│   └── (Mongoose schemas and models)
├── controllers/
│   ├── AuthController.js (Handles signup and signin)
│   ${classes.map((cls) => `├── ${ReadmeGenerator.toPascalCase(cls.name)}Controller.js`).join('\n   ')}
│   └── (Express controller functions)
├── routes/
│   ├── authRoutes.js (Public auth endpoints)
│   ${classes.map((cls) => `├── ${ReadmeGenerator.toPascalCase(cls.name)}Routes.js`).join('\n   ')}
│   └── (RESTful API routes)
├── components/
│   ${classes.map((cls) => `├── ${ReadmeGenerator.toPascalCase(cls.name)}.jsx`).join('\n   ')}
│   └── (React presentational components)
└── README.md
    └── (This file)
\`\`\`

---

## 🗄️ Models

The following Mongoose models have been generated:

${classes.map((cls) => {
  const className = ReadmeGenerator.toPascalCase(cls.name);
  let modelDesc = `### ${className}\n\n**File:** \`models/${className}.js\`\n\n`;
  modelDesc += `**Fields:**\n`;
  if (cls.attributes && Array.isArray(cls.attributes)) {
    cls.attributes.forEach((attr) => {
      modelDesc += `- \`${attr.name}\` (${attr.type})\n`;
    });
  }
  return modelDesc;
}).join('\n')}

---

## � Authentication

This generated backend includes a complete authentication system. All your diagram classes are protected and require authentication.

### Getting Started with Authentication

#### 1. Sign Up (Create New Account)

**Endpoint:** \`POST /api/auth/signup\`

**Request:**
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE3MDUzMjM4MDB9.abcdefghijk..."
  },
  "message": "User created successfully"
}
\`\`\`

**Save the token** from the response - you'll use it for all protected requests.

#### 2. Sign In (Existing User)

**Endpoint:** \`POST /api/auth/signin\`

**Request:**
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/signin \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE3MDUzMjM4MDB9.abcdefghijk..."
  },
  "message": "User signed in successfully"
}
\`\`\`

#### 3. Use the Token for Protected Routes

Once you have a token, include it in all requests to your protected routes. Example: Create a resource:

\`\`\`bash
curl -X POST http://localhost:5000/api/order \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <your-token-here>" \\
  -d '{
    "field1": "value1",
    "field2": "value2"
  }'
\`\`\`

**Authorization Header Format:**
\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

---

## 🔌 API Endpoints

### ✅ Authentication Required

All API endpoints for your diagram classes require authentication via JWT token. Include the token in the \`Authorization\` header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

**Without token**, all requests return 401 Unauthorized.

**Invalid token**, returns 401 with error message.

### HTTP Status Codes

All endpoints follow standard HTTP status codes:

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT operations with response body |
| 201 | Created | Successful POST operation |
| 204 | No Content | Successful DELETE operation (resource deleted, no response body) |
| 400 | Bad Request | Invalid input data or validation failure |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Authenticated but not authorized (don't own the document) |
| 404 | Not Found | Document does not exist |
| 500 | Internal Server Error | Server-side error during operation |

### Authorization & Data Ownership

- **GET /**: Returns only documents owned by the authenticated user
- **GET /:id, PUT /:id, DELETE /:id**: Requires ownership (userId must match). Returns 403 Forbidden if user doesn't own the document
- **POST /**: Automatically associates the created document with the authenticated user's userId

### Security Features

#### Input Validation
All API endpoints validate input data according to UML schema types:
- **number**: Must be numeric (integers/floats)
- **boolean**: Must be true/false
- **date**: Must be valid ISO date string
- **string**: Must be text

Invalid data returns 400 Bad Request with detailed error messages.

#### Data Sanitization
All POST and PUT requests sanitize input data:
- **Whitelist allowed fields**: Only fields defined in the schema are accepted
- **Reject extra fields**: Unknown properties are silently filtered out
- **Prevent injection**: No arbitrary properties can be added to documents

**Example:**

Request body with extra fields:
\`\`\`json
{
  "orderId": 12345,
  "totalAmount": 299.99,
  "__proto__": {},
  "admin": true,
  "isAdmin": false
}
\`\`\`

API processes only valid fields:
\`\`\`json
{
  "orderId": 12345,
  "totalAmount": 299.99
}
\`\`\`

Extra fields (__proto__, admin, isAdmin) are automatically removed.

### Pagination

The GET / endpoint supports pagination via query parameters:

- **page** - Page number (default: 1, starts from 1)
- **limit** - Items per page (default: 10, max: 100)

**Example with Pagination:**

\`\`\`bash
# Get page 2 with 20 items per page
curl -X GET "http://localhost:5000/api/order?page=2&limit=20" \\
  -H "Authorization: Bearer <token>"
\`\`\`

**Pagination Response Example:**

\`\`\`json
{
  "success": true,
  "data": [ /* array of documents */ ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": true,
    "nextPage": 3,
    "prevPage": 1
  },
  "message": "Order documents retrieved successfully"
}
\`\`\`

### Relationship Population

When fetching documents, you can populate related documents using the \`populate\` query parameter.

**Forward References** (documents that reference other models):
- Example: Get a Product with its Order populated
- Query: \`?populate=order\`
- The Order data is stored directly on the Product

**Virtual References** (reverse relationships using Mongoose virtuals):
- Example: Get an Order with all its Products populated
- Query: \`?populate=products\` (note the plural)
- Products are not stored on the Order, but linked through their orderId field
- Uses Mongoose virtual populate for clean querying

**Example GET with Population:**

\`\`\`bash
# Get an order with its related products populated (reverse relationship)
curl -X GET "http://localhost:5000/api/order/507f1f77bcf86cd799439011?populate=products" \\
  -H "Authorization: Bearer <token>"

# Get a product with its order populated (forward reference)
curl -X GET "http://localhost:5000/api/product/507f1f77bcf86cd799439012?populate=order" \\
  -H "Authorization: Bearer <token>"

# Populate multiple relationships (comma-separated)
curl -X GET "http://localhost:5000/api/order?populate=products&page=1&limit=10" \\
  -H "Authorization: Bearer <token>"
\`\`\`

**Populate Response Example (with virtual populate):**

\`\`\`json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "orderId": 12345,
    "totalAmount": 299.99,
    "products": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "productId": 1001,
        "price": 99.99,
        "name": "Product Name",
        "orderId": "507f1f77bcf86cd799439011"
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "productId": 1002,
        "price": 49.99,
        "name": "Another Product",
        "orderId": "507f1f77bcf86cd799439011"
      }
    ],
    "userId": "507f1f77bcf86cd799439013",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Order retrieved successfully"
}
\`\`\`

**Without Populate (default):**

\`\`\`json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "orderId": 12345,
    "totalAmount": 299.99,
    "productId": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439013",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Order retrieved successfully"
}
\`\`\`

### Base Pattern

\`\`\`
POST   /api/{model}           - Create a new document (requires auth)
GET    /api/{model}           - Get all documents owned by user (requires auth)
GET    /api/{model}/:id       - Get document by ID (requires auth + ownership)
PUT    /api/{model}/:id       - Update document (requires auth + ownership)
DELETE /api/{model}/:id       - Delete document (requires auth + ownership, returns 204 No Content)
\`\`\`

### Available Endpoints

${ classes.map((cls) => {
  const modelPath = cls.name.toLowerCase();
  return `#### ${cls.name}

\`\`\`
POST   /api/${modelPath}           - Create a new ${cls.name} (requires auth)
GET    /api/${modelPath}           - Get all ${cls.name} documents with pagination (requires auth)
GET    /api/${modelPath}/:id       - Get ${cls.name} by ID (requires auth + ownership)
PUT    /api/${modelPath}/:id       - Update ${cls.name} (requires auth + ownership)
DELETE /api/${modelPath}/:id       - Delete ${cls.name} (requires auth + ownership, returns 204 No Content)
\`\`\`

**Example GET All Request (with pagination):**

\`\`\`bash
# Get page 1 with default limit (10 items)
curl -X GET "http://localhost:5000/api/${modelPath}" \\
  -H "Authorization: Bearer <token>"

# Get page 2 with 20 items per page
curl -X GET "http://localhost:5000/api/${modelPath}?page=2&limit=20" \\
  -H "Authorization: Bearer <token>"
\`\`\`

**Example GET All Response (200):**

\`\`\`json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      ${cls.attributes?.slice(0, 2).map((attr) => `"${attr.name}": "value"`).join(',\n      ')},
      "userId": "507f1f77bcf86cd799439012",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  },
  "message": "${cls.name} documents retrieved successfully"
}
\`\`\`

**Example POST Request with Authentication:**

\`\`\`bash
curl -X POST http://localhost:5000/api/${modelPath} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\
  -d '{
    ${cls.attributes?.slice(0, 2).map((attr) => `"${attr.name}": "value"`).join(',\n    ')}
  }'
\`\`\`

**Example POST Response (201) - Created:**

\`\`\`json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    ${cls.attributes?.map((attr) => `"${attr.name}": "value"`).join(',\n    ')},
    "userId": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "${cls.name} created successfully"
}
\`\`\`

**Example DELETE Request:**

\`\`\`bash
curl -X DELETE http://localhost:5000/api/${modelPath}/507f1f77bcf86cd799439011 \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

**Example DELETE Response (204) - No Content:**

\`\`\`
(Empty response body - status code 204 indicates successful deletion)
\`\`\`

Note: 204 No Content responses have no body. The status code itself indicates success.

`;
}).join('\n')}

---

## ⚛️ React Components

React components are generated for each model. They are purely presentational and come with properly scoped CSS to prevent styling conflicts.

### Styling Approach

Each component includes:
- **JSX Component File**: \`components/ComponentName.jsx\` - Imports its own CSS
- **CSS File**: \`components/ComponentName.css\` - Contains component-scoped styles

**CSS Class Naming Convention:**

All class names are prefixed with the component name in kebab-case to prevent conflicts when multiple components are used together:

| Element | Class Name Pattern | Example |
|---------|-------------------|---------|
| Container | \`{component}-container\` | \`order-container\` |
| Fields section | \`{component}-fields\` | \`order-fields\` |
| Actions section | \`{component}-actions\` | \`order-actions\` |
| Save button | \`{component}-save-btn\` | \`order-save-btn\` |
| Delete button | \`{component}-delete-btn\` | \`order-delete-btn\` |

This scoping prevents CSS class name collisions (e.g., multiple components using "fields") and makes styling predictable and maintainable.

### Component Files

${classes.map((cls) => {
  const className = ReadmeGenerator.toPascalCase(cls.name);
  const variableName = className.charAt(0).toLowerCase() + className.slice(1);
  return `#### ${className}

**Files:**
- \`components/${className}.jsx\` - React component
- \`components/${className}.css\` - Component styles (scoped with ${variableName} prefix)

**Props:**

\`\`\`javascript
{
  ${variableName}: {
    id: string,
    ${cls.attributes?.map((attr) => `${attr.name}: ${attr.type}`).join(',\n    ')}
  },
  onSave: function,
  onDelete: function
}
\`\`\`

**Usage Example:**

\`\`\`jsx
import ${className} from './components/${className}';

function App() {
  const ${variableName}Data = {
    id: '1',
    ${cls.attributes?.slice(0, 2).map((attr) => `${attr.name}: 'example'`).join(',\n    ')}
  };

  const handleSave = () => {
    console.log('Saving ${className}...');
  };

  const handleDelete = () => {
    console.log('Deleting ${className}...');
  };

  return (
    <${className}
      ${variableName}={${variableName}Data}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
\`\`\`

**Styling:**

The component includes built-in styles with the following features:
- Responsive design for mobile and desktop
- Scoped CSS class names (prefixed with \`${variableName}-\`) to prevent conflicts
- Professional styling with card layout, shadows, and hover effects
- Accessible button states (hover, active, disabled)

To customize styles, edit \`components/${className}.css\` and modify the CSS variables or selectors with the \`${variableName}-\` prefix.

`;
}).join('\n')}

### Integrating Components

1. **Copy the component files**: Copy both \`.jsx\` and \`.css\` files to your \`frontend/src/components/\` directory
2. **Import in your app**: \`import ComponentName from './components/ComponentName'\`
3. **No global conflicts**: Scoped CSS ensures your component styles won't conflict with other components

---

## 🔗 Database Relationships

${relationships && relationships.length > 0 ? `The following relationships exist between models:

${relationships.map((rel) => {
  const fromClass = classes.find((c) => c.id === rel.from);
  const toClass = classes.find((c) => c.id === rel.to);
  return `- **${fromClass?.name} → ${toClass?.name}**: ${rel.type || 'relationship'}`;
}).join('\n')}

### Cascade Delete Behavior

When a document is deleted, related documents that reference it will have their reference field set to **null** instead of being deleted. This maintains **referential integrity** and prevents orphaned records.

**How it works:**
- Before a document is deleted, the system finds all documents that reference it
- Each referencing document has its foreign key field set to null
- If cascade delete fails, the entire delete operation is aborted (returns 500 error)
- This ensures data consistency: either everything succeeds or nothing changes

**Example:** If you delete an Order:
1. The system finds all Products with \`orderId === order._id\`
2. Sets their \`orderId\` to null
3. Then deletes the Order
4. If step 2 fails, step 3 is skipped and an error is returned

**Data Integrity:**
- No orphaned references (Products pointing to non-existent Orders)
- Broken foreign keys are prevented automatically
- Related documents are preserved but disconnected
- Follows database normalization best practices

**Note:** Relationships use the reference approach where the "many" side holds the foreign key. The "one" side (being deleted) triggers cascade updates on all "many" side references.

` : `No relationships are defined between models.

### Cascade Delete Behavior

When documents are deleted, any related documents that reference them will have their reference field set to null instead of being deleted. This prevents orphaned records.`}

---

## 🎯 Custom Methods

Custom methods are generated for your classes based on the UML diagram. Each custom method is wrapped in a **try-catch block** for comprehensive error handling. All custom methods require authentication and ownership verification.

### Error Handling in Custom Methods

Every custom method includes automatic error handling:

- **400 Bad Request**: When validation fails (e.g., document is not in a valid state)
- **401 Unauthorized**: When JWT token is missing or invalid
- **403 Forbidden**: When the user doesn't own the document
- **404 Not Found**: When the document doesn't exist
- **500 Internal Server Error**: When an unexpected error occurs during execution

**Example Error Response:**

\`\`\`json
{
  "success": false,
  "message": "Failed to execute methodName",
  "error": "error message details"
}
\`\`\`

### Implementing Custom Method Logic

Generated custom methods include smart logic based on method names and relationships:

#### add* Methods (Smart Relationship Handling)

Methods named \`add*\` automatically generate code to associate related documents:

**Auto-Generated Logic for \`addProduct\`:**
\`\`\`javascript
// POST /api/order/:id/addProduct
const addProduct = async (req, res) => {
  // 1. Extract productId from request body
  const { productId } = req.body;
  
  // 2. Validate productId is provided
  if (!productId) return res.status(400).json({ message: 'productId is required' });
  
  // 3. Find the Product to add
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  
  // 4. Check if already associated
  if (product.orderId && product.orderId.toString() === order._id.toString()) {
    return res.status(400).json({ message: 'Product is already in this Order' });
  }
  
  // 5. Associate the product with the order
  product.orderId = order._id;
  await product.save();
  
  // Return success with boolean result
  return res.status(200).json({
    success: true,
    data: true,
    message: 'Product added to Order successfully',
  });
};
\`\`\`

**How to use:**
\`\`\`bash
curl -X POST http://localhost:5000/api/order/507f1f77bcf86cd799439011/addProduct \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{ "productId": "507f1f77bcf86cd799439012" }'
\`\`\`

#### remove* and delete* Methods

Auto-generated for methods with removal semantics. Include TODO comments for custom removal logic.

#### validate* and check* Methods

Auto-generated for boolean validation methods. Include examples showing how to write validation logic.

#### Generic Custom Methods

Other custom methods receive a template with TODO comments:

\`\`\`javascript
// GET /api/{model}/:id/methodName
const methodName = async (req, res) => {
  try {
    // Fetch document from database
    const document = await Model.findById(req.params.id);
    
    // ... validation and ownership checks ...
    
    // TODO: Add your business logic here
    // Example: const updated = await Model.findByIdAndUpdate(...);
    // Example: await RelatedModel.updateMany(...);
    
    // TODO: Persist any changes: await document.save();
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'methodName executed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to execute methodName',
      error: error.message,
    });
  }
};
\`\`\`

**Tips for Implementing Business Logic:**

1. **Validate Input**: Check \`req.body\` for required fields before processing
2. **Work with Related Models**: Import other model files if you need to update related documents
3. **Use Async/Await**: All database operations are async
4. **Persist Changes**: Call \`await document.save()\` after modifying fields
5. **Return Meaningful Data**: The \`data\` field in the response should contain the operation result

---

## 🔧 Integration Instructions

### Backend Setup and Running

1. **Navigate to backend directory**:
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

2. **Configure environment variables**:
   - Copy \`.env.example\` to \`.env\`
   - Update values:
     \`\`\`env
     MONGODB_URI=mongodb://localhost:27017/your-db-name
     JWT_SECRET=your-super-secret-key
     NODE_ENV=development
     PORT=5000
     CLIENT_URL=http://localhost:5173
     \`\`\`

3. **Start MongoDB** (if running locally):
   \`\`\`bash
   # Windows
   mongod
   
   # macOS with Homebrew
   brew services start mongodb-community
   \`\`\`

4. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`
   Server will run on \`http://localhost:5000\`

5. **Verify server is running**:
   \`\`\`bash
   curl http://localhost:5000/api/health
   \`\`\`
   Expected response: \`{ "status": "ok", "message": "Backend is running" }\`

### Frontend Setup and Running

1. **Navigate to frontend directory**:
   \`\`\`bash
   cd frontend
   npm install
   \`\`\`

2. **Configure API endpoint** in \`.env\`:
   \`\`\`env
   VITE_API_URL=http://localhost:5000/api
   VITE_ENV=development
   VITE_API_TIMEOUT=30000
   \`\`\`

3. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`
   App will run on \`http://localhost:5173\`

4. **Access the application**:
   - Open \`http://localhost:5173\` in your browser
   - You'll see the home page with navigation links to all generated modules
   - Click on any module name in the navigation to access the list page

### Frontend Project Structure

The generated frontend follows this structure:

\`\`\`
frontend/
├── src/
│   ├── main.jsx          # React entry point
│   ├── App.jsx           # Main app with routing
│   ├── index.css         # Global styles
│   ├── components/       # Generated presentational components
│   │   └── [ClassNames].jsx
│   ├── pages/            # Generated page components
│   │   ├── Home.jsx
│   │   ├── [ClassName]List.jsx
│   │   └── [ClassName]Form.jsx
│   ├── services/         # API service utilities
│   └── styles/           # Component styles
├── index.html            # HTML entry point
├── package.json
├── .env.example
└── vite.config.js        # Vite configuration
\`\`\`

### Frontend Features

- **Home Page**: Landing page with quick navigation
- **List Pages**: Display all records for each generated class with pagination (if applicable)
- **Form Pages**: Create and edit forms for each class with validation
- **Navigation**: Top navigation bar with links to all modules
- **Styling**: Responsive design with modern CSS styling
- **API Integration**: Automatic API calls to backend using configured base URL

### Manual Backend Integration (if not using generated server.js)

1. **Copy model files** to \`backend/src/models/\`
2. **Copy controller files** to \`backend/src/controllers/\`
3. **Copy route files** to \`backend/src/routes/\`
4. **Import routes** in your \`server.js\` (see Quick Start Step 4)
5. **Ensure MongoDB connection** is configured in your environment

### Frontend Integration

1. **Copy component files** to \`frontend/src/components/\`
2. **Import components** where needed in your React app
3. **Provide data and callbacks** as props to components
4. **Configure API base URL** for backend requests

---

## 🌍 Environment Variables

Ensure the following environment variables are set in your \`.env\` file:

\`\`\`env
# MongoDB Connection
# Database name should match your project: ${projectName}
MONGO_URI=mongodb://localhost:27017/${databaseName}

# Backend Server
PORT=5000
NODE_ENV=development

# JWT Authentication (REQUIRED - Change the secret key!)
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
\`\`\`

**Important Notes:**

1. **Database Name**: The database name \`${databaseName}\` should match your MongoDB database name. Use lowercase with hyphens (kebab-case) for consistency.
2. **MongoDB URI**: Replace \`localhost:27017\` with your actual MongoDB connection string if using MongoDB Atlas or another remote host.
3. **JWT_SECRET**: This is used to sign and verify authentication tokens. In production, use a strong, randomly generated secret (at least 32 characters) and keep it secure in a password manager or secrets vault.
4. **JWT_EXPIRES_IN**: Token expiration time (e.g., '7d' for 7 days, '24h' for 24 hours).

**Example for Production:**

\`\`\`env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/${databaseName}?retryWrites=true&w=majority
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
\`\`\`

---

## 📌 Next Steps

### Recommended Enhancements

1. **Add Input Validation** - (Already implemented with type checking)
2. **Add Pagination** - (Already implemented on GET endpoints)
3. **Add Error Handling** - Implement comprehensive error handling middleware
4. **Add Logging** - Implement logging for debugging and monitoring
5. **Add Testing** - Write unit and integration tests
6. **Add Search/Filter** - Add query parameters for filtering and searching
7. **Add Rate Limiting** - Implement rate limiting to prevent abuse
8. **Add CORS** - Configure CORS settings as needed
9. **Add API Documentation** - Use Swagger/OpenAPI for API documentation
10. **Add Refresh Token Logic** - Implement token refresh for improved security

### Common Customizations

- **Modify schemas** - Add validations, indexes, or custom methods to models
- **Enhance controllers** - Add business logic, transactions, or aggregations
- **Style components** - Add CSS or styling to React components
- **Add hooks** - Convert components to use React hooks if needed

---

## 📚 Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/)
- [Express Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [RESTful API Best Practices](https://restfulapi.net/)

---

**Generated with ArchitectAuto - UML to Code Generator**
`;

    return readmeContent;
  },
};

module.exports = ReadmeGenerator;
