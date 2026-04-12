# ArchitectAuto - UML to Code Generator Frontend

A React + Vite frontend application for the ArchitectAuto UML to Code Generator.

## Project Structure

```
src/
├── main.jsx                 # Application entry point
├── App.jsx                  # Main App component
├── App.css                  # App styles
├── index.css                # Global styles
├── pages/
│   └── SignIn/
│       ├── SignIn.jsx       # Sign In page component
│       └── SignIn.css       # Sign In page styles
├── components/              # Reusable components (for future use)
└── assets/                  # Static assets (images, fonts, etc.)

public/                      # Static files served directly
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Features

- **Sign In Page**: Professional authentication interface with:
  - Email input field (pre-filled with test1@gmail.com)
  - Password input field with masking
  - Sign In button with arrow icon
  - Sign up link for new users
  - Responsive design
  - Modern UI with beige/tan theme and blue accent colors

## Technologies

- **React 18**: JavaScript library for building user interfaces
- **Vite**: Next generation frontend build tool
- **CSS3**: Modern styling with responsive design

## Future Enhancements

- Add Sign Up page
- Implement authentication logic
- Add dashboard page
- Create reusable UI components
- Add form validation
- Implement error handling

## License

© 2026 ArchitectAuto. All Rights Reserved.
