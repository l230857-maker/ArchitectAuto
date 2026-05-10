# ArchitectAuto - Complete Project Summary

## 1. PROJECT OVERVIEW

**ArchitectAuto** is a comprehensive web application designed to convert UML diagrams into functional code. It provides a full-stack solution with a modern React frontend and a Node.js/Express backend powered by MongoDB.

**Tech Stack:**
- **Frontend:** React 18 + Vite + React Router DOM + ReactFlow (for diagram visualization)
- **Backend:** Node.js + Express.js + MongoDB + Mongoose + JWT + Bcrypt
- **Architecture:** Hexagonal Architecture (Domain-Driven Design) on backend
- **Version:** 1.0.0

---

## 2. BACKEND ARCHITECTURE

### 2.1 Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js (4.18.2)
- **Database:** MongoDB (8.0.3 via Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Security:** Bcrypt (bcryptjs 2.4.3)
- **CORS:** Enabled for cross-origin requests
- **Dev Tool:** Nodemon for development

### 2.2 Hexagonal Architecture (Clean Architecture)

The backend follows **Hexagonal Architecture** with clear separation of concerns:

```
src/
├── domain/
│   ├── entities/           # Business logic entities (User, Project, ClassDiagram, OtherDiagram)
│   ├── errors/             # Custom error handling (AppError)
│   └── ports/              # Interfaces/contracts (repositories and services)
├── application/
│   └── usecases/           # Business use cases (SignIn, SignUp, GetProjects, GetDiagrams)
├── adapters/
│   ├── http/               # HTTP layer (controllers, routes, middlewares)
│   ├── database/           # MongoDB integration (models, repositories)
│   └── services/           # External services (JWT, Bcrypt)
└── infrastructure/
    └── config/             # Configuration (database connection)
```

### 2.3 Core Components

#### **Domain Layer**
- **Entities:**
  - `User` - Email and passwordHash fields
  - `Project` - name, stack_name, userId, diagram references
  - `ClassDiagram` - UML class diagrams with visual layout and structured data
  - `OtherDiagram` - Other UML diagram types (activity, sequence, state, usecase, ER)

- **Ports (Interfaces):**
  - `UserRepository` - User data persistence
  - `ProjectRepository` - Project data persistence
  - `ClassDiagramRepository` - Class diagram storage
  - `OtherDiagramRepository` - Other diagram storage
  - `TokenService` - JWT token generation/verification
  - `PasswordService` - Password hashing/comparison

- **Errors:**
  - `AppError` - Custom error with statusCode and details

#### **Application Layer (Use Cases)**
1. **SignUpUseCase**
   - Validates email, password, confirmPassword
   - Checks if user already exists
   - Hashes password with Bcrypt
   - Creates new user and generates JWT token

2. **SignInUseCase**
   - Validates credentials
   - Compares password with stored hash
   - Generates JWT token upon success

3. **GetProjectsUseCase**
   - Retrieves all projects for authenticated user
   - Filters by userId

4. **GetDiagramsUseCase**
   - Fetches class diagrams and other diagrams for a project
   - Returns structured diagram data

#### **Adapter Layer**

**HTTP Controllers:**
- `AuthController` - Handles signup/signin endpoints
- `ProjectController` - Handles project and diagram fetches

**Routes:**
- `/api/auth/signup` - POST - User registration
- `/api/auth/signin` - POST - User login
- `/api/projects` - POST - Create new project (requires auth)
- `/api/projects/my-projects` - GET - Fetch user's projects (requires auth)
- `/api/projects/:projectId/diagrams` - GET - Fetch project diagrams (requires auth)

**Middlewares:**
- `authMiddleware` - JWT token verification and userId extraction (reads `sub` claim from token)
- `errorHandler` - Global error handling with statusCode and message

**Services:**
- `JwtTokenService` - JWT token generation and verification
- `BcryptPasswordService` - Password hashing and comparison

**Repositories (MongoDB):**
- `MongoUserRepository` - User CRUD operations
- `MongoProjectRepository` - Project CRUD with userId filtering
- `MongoClassDiagramRepository` - Class diagram storage with projectId indexing
- `MongoOtherDiagramRepository` - Other diagram storage

#### **MongoDB Models**
1. **UserModel**
   - email (unique, lowercase, required)
   - passwordHash (required)
   - timestamps

2. **ProjectModel**
   - name (required)
   - stack_name (enum: MERN, PERN, MEAN, MEVN, LAMP, JAMSTACK, Other)
   - userId (indexed for performance)
   - classDiagramId (optional reference)
   - otherDiagramIds (array of references with null/undefined safety)
   - timestamps

3. **ClassDiagramModel**
   - name (required)
   - projectId (indexed)
   - visualLayout (ReactFlow nodes and edges)
   - structuredUML (classes with attributes, methods, relationships)
   - timestamps

4. **OtherDiagramModel**
   - name (required)
   - type (enum: activity, sequence, usecase, erd, state)
   - projectId (indexed)
   - visualLayout (ReactFlow nodes and edges)
   - timestamps

### 2.4 Server Configuration
- **Port:** 5000 (with automatic fallback to next available port)
- **CORS Origin:** http://localhost:5173 (or CLIENT_URL env)
- **Database:** MongoDB Atlas (connection string in .env)
- **Health Check:** GET /api/health

---

## 3. FRONTEND ARCHITECTURE

### 3.1 Technology Stack
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.8
- **Routing:** React Router DOM 7.14.0
- **Diagram Visualization:** ReactFlow 11.11.4
- **Styling:** Pure CSS3 (responsive design)

### 3.2 Project Structure

```
src/
├── main.jsx              # Entry point with Router
├── App.jsx               # Route definitions
├── App.css               # Global styles
├── index.css             # Base styles
├── lib/
│   ├── auth.js          # Auth session management (localStorage)
│   └── api.js           # API client with error handling
├── components/
│   ├── pages/
│   │   ├── SignIn/       # Login page
│   │   ├── SignUp/       # Registration page
│   │   ├── Dashboard/    # Project listing and management
│   │   ├── StackSelector/    # Tech stack selection
│   │   ├── DiagramSelector/  # UML diagram type selection
│   │   ├── ProjectDetails/   # Project overview
│   │   ├── ClassDiagram/     # Class diagram canvas editor
│   │   └── UserProfile/      # User settings and logout
│   └── Canvas/           # ReactFlow canvas component
└── assets/
    ├── StackSelector-images/    # Stack thumbnails
    └── DiagramSelector-images/  # Diagram type thumbnails
```

### 3.3 Pages and Features

#### **1. SignIn Page** (`/signin`)
- Email and password input fields
- Form validation
- Error message display
- Link to signup page
- Calls `/auth/signin` endpoint
- Saves auth session to localStorage
- Redirects to dashboard on success
- Default route points here

#### **2. SignUp Page** (`/signup`)
- Email, password, confirm password inputs
- Password validation (minimum 6 characters, matching)
- Duplicate email checking
- Calls `/auth/signup` endpoint
- Saves auth session and redirects to dashboard
- Link to signin page

#### **3. Dashboard** (`/dashboard`)
- Displays authenticated user's email
- Fetch and list all user projects from `/api/projects/my-projects`
- Project cards show: name, stack, diagram count
- Create new project button
- Profile and logout buttons
- Click project to view details
- Uses auth middleware to fetch projects
- Shows "No projects created" when user has no projects

#### **4. StackSelector** (`/stack-selector`)
- Project name input
- Tech stack selection (MERN, PERN, MEAN, MEVN, LAMP, JAMstack)
- Grid layout with stack images
- Passes selected project to diagram selector
- Back to dashboard navigation

#### **5. DiagramSelector** (`/diagram-selector`)
- Displays selected project info (name, stack)
- UML diagram type options (Class, Activity, Sequence, State, UseCase, ER)
- Grid layout with diagram images
- Class diagram navigates to editor
- Other diagrams show selection message
- Back to dashboard navigation

#### **6. ClassDiagram** (`/class-diagram`)
- Canvas editor powered by ReactFlow
- Features:
  - Add classes with attributes and methods
  - Create relationships between classes
  - Visual drag-and-drop interface
  - Export diagram data
  - Generate code from class diagrams
  - Multiple interaction modes
- Backend storage not fully connected yet

#### **7. OtherDiagram** (`/other-diagram`)
- Canvas editor for non-class diagrams (Activity, Sequence, ER, State, UseCase)
- **Generic Shape-Based Tools:**
  - **Shape Toolbar:** Rectangle, Square, Circle, TextBox (4 tools in 2x2 grid)
  - **Immediate Creation:** Click any shape tool to instantly add shape to canvas
  - **Auto-Generated Labels:** Shapes spawn with auto-capitalized labels (e.g., "Rectangle", "Circle")
  - **Proper Shape Rendering:**
    - Rectangle: 120×80px, rounded corners
    - Square: 100×100px, rounded corners
    - Circle: 80×80px, fully rounded (borderRadius: 999px)
    - TextBox: 150×40px, light background, more rounded
  - **Shape Management:**
    - Click shape to select (displays editable properties in panel)
    - Only one shape can be selected at a time
    - Creating a new shape automatically deselects the previously selected shape
    - **Edit Label:** Input field to add/edit text on any shape
    - **Edit Dimensions:** Width and Height inputs with smart validation:
      - Accept any whole number input (no restrictions while typing)
      - Leading zeros automatically removed (e.g., "0325" → "325")
      - Validation and clamping applied **only when clicking Update button:**
        - **Min:** 30px (width and height)
        - **Max:** 800px (width and height)
        - Values outside range are automatically clamped to valid range
      - Empty field allowed (reverts to default 120/80 on update)
    - "Update Shape" button to apply all changes (auto-clamps dimensions)
    - "Delete Shape" button removes selected shape and its connections
    - **Keyboard Delete:** Press Delete key to remove selected shape
  - **Connections:**
    - Drag from shape handles to another shape to create connections
    - Connections are visual lines showing relationships between shapes
    - **Selectable Connections:** Click any connection line to select it
    - **Connection Properties:** Edit label and line width for selected connection
    - **Connection Management:** Delete connections via UI button
  - **Diagram Info Display:**
    - Shows diagram type (activity, sequence, etc.)
    - Total shapes count
    - Total connections count
- Uses custom `ShapeNode` renderer from Canvas component for proper shape styling
- **Fixed Shape Re-selection Bug (✅ FIXED):**
  - Root Causes:
    1. ReactFlow's `selected` property on nodes wasn't being properly managed
    2. `nodeTypes` was being recreated on every render inside the component
  - Final Fix Applied:
    1. Added `selected: true` property to newly created nodes in addShape()
    2. Updated handleNodeClick to set/unset `selected` property on all nodes
    3. Updated onPaneClick to clear `selected` property from all nodes
    4. **Moved nodeTypes definition outside component** - now uses module-level constant
    5. This ensures ReactFlow gets the same reference on every render, eliminating infinite errors
- No Generate Code button
- No save/export features yet
- Clean, fast shape creation workflow

#### **8. ProjectDetails** (`/project-details`)
- Shows project information (name, stack, diagram count)
- Fetches diagrams from `/api/projects/:projectId/diagrams`
- Displays diagram cards in grid layout
- **Diagram Display Logic:**
  - Class diagrams: Show with ClassDiagram image, navigate to `/class-diagram`
  - Other diagrams: Look at `type` field and display appropriate image, navigate to `/other-diagram`:
    - `activity` → Activity Diagram image
    - `sequence` → Sequence Diagram image
    - `erd` → ER Diagram image
    - `state` → State Diagram image
    - `usecase` → Use Case Diagram image
  - Uses `diagramTypeMap` object to map type to title and image
- Error handling shows "Failed to fetch" if endpoint returns error
- Loading state shows "Loading diagrams..." while fetching
- Empty state shows "No diagrams yet. Create one to get started!" when no diagrams exist

#### **9. UserProfile** (`/profile`)
- Display current user email
- Change password form (UI ready, backend endpoint pending)
- Back to dashboard button
- Logout button

### 3.4 API Integration

**API Base URL:** `http://localhost:5000/api` (configurable via VITE_API_BASE_URL env)

**Authentication:**
- Tokens stored in localStorage as `architectauto-auth`
- Auth header format: `Bearer <token>`
- Session includes: user (id, email), token

**Helper Functions (lib/api.js):**
- `postJson(path, body)` - POST requests with JSON handling
- `parseJsonSafely()` - Safe JSON parsing with error handling
- Error messages thrown as Error objects

**Helper Functions (lib/auth.js):**
- `saveAuthSession({user, token})` - Persist auth to localStorage
- `getAuthSession()` - Retrieve auth from localStorage
- `clearAuthSession()` - Remove auth on logout

### 3.5 Design System
- **Color Scheme:** Beige/tan primary with blue accents
- **Typography:** Clean, modern fonts
- **Responsive Design:** Mobile-first CSS with media queries
- **Layout:** Grid and flexbox for responsive layouts

---

## 4. KEY WORKFLOWS

### 4.1 User Registration & Authentication Flow
```
SignUp Page → POST /auth/signup → Backend validates & hashes password
→ Creates user in MongoDB → Generates JWT → Returns user + token
→ Frontend saves to localStorage → Redirects to Dashboard
```

### 4.2 User Login Flow
```
SignIn Page → POST /auth/signin → Backend finds user & compares password
→ Generates JWT → Returns user + token → Frontend saves session
→ Redirects to Dashboard
```

### 4.3 Project Creation Flow
```
Dashboard → Create New Project → StackSelector (enter name + choose stack)
→ DiagramSelector (choose diagram type) → ClassDiagram editor
→ (Backend integration pending for saving)
```

### 4.4 Fetch User Projects
```
Dashboard mounts → GET /api/projects/my-projects (with Bearer token)
→ authMiddleware extracts userId → GetProjectsUseCase retrieves from DB
→ Returns array of projects → Frontend renders in grid
```

### 4.5 Fetch Project Diagrams
```
ProjectDetails mounts → GET /api/projects/:projectId/diagrams (with Bearer token)
→ authMiddleware validates → GetDiagramsUseCase fetches diagrams
→ Returns {classDiagram, otherDiagrams} → Frontend displays
```

### 4.6 Display Diagrams by Type
```
ProjectDetails fetches diagrams → Component sorts into:
  - classDiagram: single ClassDiagram object (if exists)
  - otherDiagrams: array of OtherDiagram objects
→ getDiagramCards() maps diagrams using diagramTypeMap:
  - Class diagrams show ClassDiagram image and card
  - Activity diagrams show Activity Diagram image
  - Sequence diagrams show Sequence Diagram image
  - ER diagrams show ER Diagram image
  - State diagrams show State Diagram image
  - UseCase diagrams show Use Case Diagram image
→ Frontend displays grid of diagram cards with click handlers
```

---

## 5. DATA MODELS & RELATIONSHIPS

### 5.1 User
```javascript
{
  _id: ObjectId,
  email: string (unique, lowercase),
  passwordHash: string,
  createdAt: Date,
  updatedAt: Date
}
```

### 5.2 Project
```javascript
{
  _id: ObjectId,
  name: string,
  stack_name: 'MERN' | 'MEAN' | 'MEVN' | 'Other',
  userId: ObjectId (ref: User),
  classDiagramId: ObjectId | null (ref: ClassDiagram),
  otherDiagramIds: [ObjectId] (ref: OtherDiagram),
  createdAt: Date,
  updatedAt: Date
}
```

### 5.3 ClassDiagram
```javascript
{
  _id: ObjectId,
  name: string,
  projectId: ObjectId (ref: Project, indexed),
  visualLayout: {
    nodes: [ReactFlow nodes],
    edges: [ReactFlow edges]
  },
  structuredUML: {
    classes: [{
      id: string,
      name: string,
      attributes: [{name, type}],
      methods: [{name, returnType, parameters: [{name, type}]}]
    }],
    relationships: [{
      from: string,
      to: string,
      type: 'one-to-one' | 'one-to-many' | 'many-to-one'
    }]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 5.4 OtherDiagram
```javascript
{
  _id: ObjectId,
  name: string,
  type: 'activity' | 'sequence' | 'usecase' | 'erd' | 'state',
  projectId: ObjectId (ref: Project, indexed),
  visualLayout: {
    nodes: [ReactFlow nodes],
    edges: [ReactFlow edges]
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 6. ENVIRONMENT CONFIGURATION

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://[credentials]@cluster0.xmxgpfm.mongodb.net/ArchitectAuto
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (.env.example)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### 7. CURRENT STATUS & MISSING FEATURES

#### ✅ Fixed Issues (Latest Session)
- **Auth Token Extraction** - Changed middleware to read `sub` claim from JWT token
- **Project Fetch Endpoint** - GET `/api/projects/my-projects` now properly extracts userId
- **Project Creation** - Added POST `/api/projects` endpoint for creating projects via API
- **Stack Validation** - Updated to support MERN, PERN, MEAN, MEVN, LAMP, JAMSTACK, Other
- **Array Mapping Bug** - Fixed null/undefined handling in otherDiagramIds mapping
- **Infinite Request Loop** - Fixed useEffect dependency in Dashboard by using `session?.token` (scalar value)
- **ProjectDetails Infinite Loop** - Fixed useEffect to use `project?.id` and `session?.token` as dependencies instead of entire objects
- **Diagram Type Display** - Frontend now correctly displays diagrams based on their `type` field using `diagramTypeMap`
- **Removed Debug Logging** - Cleaned up console logs from ProjectController and MongoProjectRepository
- **Diagram Fetching** - GET `/api/projects/:projectId/diagrams` returns structured response with `classDiagram` and `otherDiagrams[]`
- **OtherDiagram Component** - Created at `frontend/src/components/pages/OtherDiagram/OtherDiagram.jsx` for editing non-class diagrams
- **OtherDiagram CSS** - Created `OtherDiagram.css` in same folder with shared diagram editor styles
- **OtherDiagram Imports** - Canvas uses `../../Canvas/Canvas`, CSS uses `./OtherDiagram.css`
- **DiagramSelector Navigation** - Updated to navigate to `/other-diagram` for non-class diagram selections
- **StackSelector Project Creation** - Updated StackSelector to call POST `/api/projects` endpoint when stack is selected
- **StackSelector Loading State** - Added isLoading state to disable inputs/buttons during project creation
- **StackSelector Navigation** - After successful project creation, navigates to `/diagram-selector` with project details
- **StackSelector Auth Storage Key** - Fixed to use correct key `'architectauto-auth'` from auth.js when retrieving token
- **StackSelector Stack Name Mapping** - Added stackNameMap to convert stack IDs to backend values (e.g., 'jam' → 'JAMSTACK')
- **Dashboard Project Sorting** - Modified MongoProjectRepository.findByUserId to sort projects by `updatedAt` descending (newest first)
- **ProjectDetails Create Diagram Button** - Added "Create Diagram" button that navigates to DiagramSelector page regardless of existing diagrams
- **DiagramSelector Tech Stack Display** - Fixed to display `project.stack_name` (from database) with fallback to `project.stack` for new projects
- **DiagramSelector Class Diagram Check** - Added useEffect to fetch existing diagrams when coming from project-details
- **DiagramSelector Hide Existing Class** - Filters out ClassDiagram card if one already exists in the project (only 1 class diagram per project)
- **DiagramSelector Diagram Name Input** - Added dialog to capture diagram name when user selects a diagram type
- **DiagramSelector Name Dialog UI** - Modal dialog with input field, Cancel and Create buttons, supports Enter key to confirm
- **ClassDiagram Back Button** - Updated to navigate directly to dashboard instead of conditional back URL
- **OtherDiagram Back Button** - Updated to navigate directly to dashboard instead of conditional back URL
- **CreateClassDiagramUseCase** - New usecase that creates ClassDiagram documents with name and empty layout/structure
- **CreateOtherDiagramUseCase** - New usecase that creates OtherDiagram documents with name, type, and empty layout
- **ClassDiagram/OtherDiagram Models** - Updated to make visualLayout and structuredUML optional with default empty values
- **ProjectController Diagram Creation** - Added createClassDiagram and createOtherDiagram endpoints
- **ProjectRoutes** - Added POST `/projects/:projectId/class-diagrams` and `/projects/:projectId/other-diagrams` endpoints
- **ClassDiagram Save Functionality** - Saves diagram with Ctrl+S or Save button
- **ClassDiagram Export** - Enhanced exports to PNG, PDF, and SVG formats:
  - **SVG Export**: Generates properly styled SVG with dynamic viewBox, blue headers, proper connections
  - **PNG Export**: Uses SVG to canvas conversion with 2x scaling for quality
  - **PDF Export**: Converts SVG to canvas image and embeds in jsPDF with multi-page support
  - All formats share single SVG generation function (generateSVGContent) for consistency
- **OtherDiagram Save Functionality** - Saves diagram with Ctrl+S or Save button to otherdiagrams MongoDB collection
- **OtherDiagram Import Functionality** - Imports .json files containing diagram structure (visualLayout with nodes and edges)
- **OtherDiagram Export Functionality** - Exports diagrams to PNG, PDF, and SVG formats:
  - **SVG Export**: Generates SVG with shapes (rectangles, squares, circles, textboxes) and connection lines with arrows
  - **PNG Export**: Canvas-based conversion with 3x scaling for quality
  - **PDF Export**: Multi-page PDF support with proper scaling and centering
- **OtherDiagram Navbar Buttons** - Added Save, Import, Export buttons matching ClassDiagram styling
- **OtherDiagram Keyboard Shortcut** - Ctrl+S saves diagram (also triggers on Delete key for shape deletion)
- **OtherDiagram Ctrl+S Fix** - Fixed useEffect dependency array for keydown listener to include `[selectedNodeId, nodes, edges, project]` so Ctrl+S saves latest version (not stale state)
- **ClassDiagram Load Saved Diagram** - Loads diagram from database when navigating from ProjectDetails (reads visualLayout.nodes/edges)
- **OtherDiagram Load Saved Diagram** - Loads diagram from database when navigating from ProjectDetails (reads visualLayout.nodes/edges)

#### **Diagram Loading Flow (ClassDiagram & OtherDiagram)**
When a user clicks on a saved diagram from ProjectDetails:
1. **ProjectDetails** fetches all project diagrams from `/api/projects/:projectId/diagrams`
   - Returns: `{ classDiagram: {...}, otherDiagrams: [...] }`
   - Each diagram includes `visualLayout: { nodes: [...], edges: [...] }`
2. **ProjectDetails.handleDiagramClick** passes full diagram object via navigation state
   - ClassDiagram: `navigate('/class-diagram', { state: { diagram: diagrams.classDiagram, project, from: 'project-details' } })`
   - OtherDiagram: `navigate('/other-diagram', { state: { diagram: diagramData, project, from: 'project-details' } })`
3. **Canvas Component useEffect** (lines 106-113 in ClassDiagram, 94-101 in OtherDiagram):
   - Checks if `diagram?.visualLayout` exists
   - Loads `diagram.visualLayout.nodes` into canvas via `setNodes()`
   - Loads `diagram.visualLayout.edges` into canvas via `setEdges()`
   - ReactFlow automatically renders all nodes and edges on the canvas
4. **User can now edit** the loaded diagram and save changes with Ctrl+S or Save button

#### **Technical Note: Ctrl+S State Closure Issue & Fix**
In OtherDiagram, the Ctrl+S keyboard listener was saving stale state (old `nodes` and `edges`) instead of current values.
- **Root Cause**: The `useEffect` hook for keydown event listener had dependency array `[selectedNodeId]`
  - When `nodes` or `edges` changed, the event listener still referenced the old values (closure issue)
  - User would press Ctrl+S but the old diagram would be saved instead of the latest changes
- **Solution**: Updated dependency array to `[selectedNodeId, nodes, edges, project]`
  - Now the listener is recreated whenever `nodes`, `edges`, or `project` change
  - Ctrl+S always has access to the current state
  - Matches ClassDiagram implementation pattern (line 104: `}, [nodes, edges, project])`)
- **Result**: Both Save button and Ctrl+S now save the same (latest) version of the diagram

#### **Technical Note: Diagram Query & Cascade Deletion Fixes**
Fixed critical bugs in diagram retrieval and account deletion:
1. **MongoClassDiagramRepository.findByProjectId()**:
   - **Bug**: Used `findOne()` which only returned first diagram, `deleteOne()` which only deleted first diagram
   - **Fix**: Changed to `find()` returning all diagrams as array, `deleteMany()` to delete all
   - **Impact**: Projects can now have max 1 ClassDiagram, but logic must handle arrays
2. **GetDiagramsUseCase & GetProjectsUseCase**:
   - **Bug**: After findByProjectId() now returns arrays, code was treating ClassDiagrams as single objects
   - **Fix**: Updated to check array length and extract first element: `(classdiagrams && classdiagrams.length > 0) ? classdiagrams[0] : null`
   - **Impact**: Diagram counts now accurate, ProjectDetails shows correct diagrams
3. **DeleteAccountUseCase**:
   - **Bug**: Used nested loops to delete individual diagrams (inefficient and error-prone)
   - **Fix**: Now uses `deleteByProjectId()` for bulk deletion (cleaner, faster, safer)
   - **Cascade Order**: diagrams → projects → user (ensures referential integrity)
- **Result**: Account deletion now properly removes all associated data, diagram counts accurate

#### ✅ Implemented
- User authentication (signup/signin) with JWT
- Password hashing with Bcrypt
- User session management (localStorage)
- Project CRUD endpoints (create, read)
- Dashboard with project listing
- Stack and diagram selector UI
- ClassDiagram canvas editor with save/export (PNG, PDF, SVG)
- OtherDiagram page with generic shape tools (Rectangle, Square, Circle, TextBox)
- Shape creation, selection, and deletion in OtherDiagram
- **Shape properties editing** (label, width, height) in OtherDiagram properties panel
- **Keyboard delete support** (Delete key removes selected shape)
- **Selectable connections/edges** between shapes
- **Connection properties editing** (label and line width for selected edge)
- **Connection deletion** via UI button
- **OtherDiagram Save Functionality** - Saves to otherdiagrams MongoDB collection with Ctrl+S or Save button
- **OtherDiagram Import Functionality** - Import .json files with diagram structure
- **OtherDiagram Export Functionality** - Export to PNG, PDF, SVG with proper rendering of shapes and connections
- **OtherDiagram Navbar Buttons** - Save, Import, Export buttons matching ClassDiagram style
- **ClassDiagram Load Saved Diagram** - Automatically loads saved diagrams from database when clicked in ProjectDetails
- **OtherDiagram Load Saved Diagram** - Automatically loads saved diagrams from database when clicked in ProjectDetails
- **Delete Account Feature** - Added complete account deletion flow:
  - **Frontend**: UserProfile.jsx - Delete Account button opens confirmation modal with password verification
  - **Modal UI**: Warning message, password input, Cancel and Delete buttons
  - **Backend**: DeleteAccountUseCase with cascade deletion (user → projects → all diagrams)
  - **API Route**: DELETE `/api/auth/delete-account` with auth middleware and password verification
  - **Security**: Uses Bcrypt password comparison before allowing deletion
  - **Cascade Logic**: Deletes all ClassDiagrams and OtherDiagrams in projects before deleting projects and user
  - **Session Cleanup**: Frontend clears auth session and redirects to signin after successful deletion
- Responsive design across all pages
- Error handling and validation
- MongoDB integration
- CreateProjectUseCase with validation
- Password change functionality
- Backend save/update for ClassDiagrams and OtherDiagrams

#### ⏳ Pending/In Progress
- Code generation from diagrams (core feature)
- Seeding test diagrams to database (use `backend/seed-test-diagrams.js`)

---

## 8. SECURITY FEATURES
- **Password Security:** Bcrypt with salt rounds = 10
- **Token Security:** JWT with 7-day expiration
- **CORS Protection:** Configured for localhost:5173
- **Email Validation:** Lowercase normalization
- **Authentication Middleware:** Token verification on protected routes
- **Input Validation:** Email, password, and field presence checks
- **Error Messages:** Generic messages (e.g., "Invalid email or password" instead of revealing which is wrong)

---

## 9. DATABASE SCHEMA HIGHLIGHTS
- **Indexing:** userId on Project, projectId on ClassDiagram and OtherDiagram for query performance
- **Relationships:** References (refs) between User↔Project↔Diagrams
- **Data Integrity:** Unique email constraint, enum values for stack and diagram types
- **Timestamps:** Automatic createdAt/updatedAt on all models

---

## 10. HOW TO RUN

### Backend
```bash
cd backend
npm install
# Set up .env file with MONGO_URI and other configs
npm run dev    # Uses nodemon for auto-reload
# Server runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # Vite dev server
# App runs on http://localhost:5173
```

---

## 11. PROJECT GOALS & VISION

ArchitectAuto aims to bridge the gap between UML diagram design and code generation. Users can:
1. **Create Projects** with technology stack selection
2. **Design UML Diagrams** visually using the canvas editor
3. **Auto-Generate Code** from diagram specifications
4. **Manage Multiple Projects** with different stacks
5. **Version Control Diagrams** with timestamps

The hexagonal architecture ensures the system is maintainable, testable, and easily extensible for future code generation features.

---

## 12. KEY FILES STRUCTURE SUMMARY

**Backend Core Files:**
- `server.js` - Express app setup and dependency injection
- `src/application/usecases/*` - Business logic
- `src/adapters/http/controllers/*` - Request handlers
- `src/adapters/http/routes/*` - Route definitions
- `src/adapters/database/repositories/*` - Data access layer
- `src/adapters/http/middlewares/*` - Express middleware

**Frontend Core Files:**
- `src/main.jsx` - App entry with Router
- `src/App.jsx` - Route definitions
- `src/lib/api.js` - API client
- `src/lib/auth.js` - Auth persistence
- `src/components/pages/*` - Page components
- `src/components/Canvas/Canvas.jsx` - ReactFlow integration

---

**Project Created:** 2026  
**Tech Stack:** MERN Stack Variant  
**Architecture:** Hexagonal (Domain-Driven Design)  
**Status:** Active Development
