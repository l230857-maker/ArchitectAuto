const ReactAppGenerator = {
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

  generate: (classes = [], projectName = '') => {
    const files = [];

    try {
      const mainContent = ReactAppGenerator.generateMain();
      files.push({
        path: 'frontend/src/main.jsx',
        content: mainContent,
      });
    } catch (error) {
      console.error('Error generating main.jsx:', error.message);
    }

    try {
      const appContent = ReactAppGenerator.generateApp(classes);
      files.push({
        path: 'frontend/src/App.jsx',
        content: appContent,
      });
    } catch (error) {
      console.error('Error generating App.jsx:', error.message);
    }

    try {
      const indexContent = ReactAppGenerator.generateIndexHtml(projectName);
      files.push({
        path: 'frontend/index.html',
        content: indexContent,
      });
    } catch (error) {
      console.error('Error generating index.html:', error.message);
    }

    return files;
  },

  generateMain: () => {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;
  },

  generateApp: (classes = [], projectName = '') => {
    const classNames = classes.map(cls => ReactAppGenerator.toPascalCase(cls.name));

    return `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
`;
  },

  generateIndexHtml: (projectName = '') => {
    const title = projectName 
      ? `${projectName} - MERN App`
      : 'ArchitectAuto - MERN Application';

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
  },
};

module.exports = ReactAppGenerator;
