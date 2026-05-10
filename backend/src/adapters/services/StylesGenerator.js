const StylesGenerator = {
  generate: () => {
    const files = [];

    try {
      const indexCss = StylesGenerator.generateIndexCss();
      files.push({
        path: 'frontend/src/index.css',
        content: indexCss,
      });
    } catch (error) {
      console.error('Error generating index.css:', error.message);
    }

    try {
      const appCss = StylesGenerator.generateAppCss();
      files.push({
        path: 'frontend/src/App.css',
        content: appCss,
      });
    } catch (error) {
      console.error('Error generating App.css:', error.message);
    }

    try {
      const homeCss = StylesGenerator.generateHomeCss();
      files.push({
        path: 'frontend/src/styles/Home.css',
        content: homeCss,
      });
    } catch (error) {
      console.error('Error generating Home.css:', error.message);
    }

    return files;
  },

  generateIndexCss: () => {
    return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
}

html, body, #root {
  height: 100%;
  width: 100%;
}

button {
  cursor: pointer;
  border: 1px solid;
  font-family: inherit;
}

button:hover {
  opacity: 0.8;
}

input, textarea, select {
  font-family: inherit;
  border: 1px solid;
  padding: 8px 12px;
}

a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

h1, h2, h3 {
  margin-bottom: 1rem;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 18px;
}

.error {
  border: 1px solid;
  padding: 12px 16px;
  margin: 1rem 0;
}

.success {
  border: 1px solid;
  padding: 12px 16px;
  margin: 1rem 0;
}
`;
  },

  generateAppCss: () => {
    return `.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Main Content */
.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 0.5rem;
  }
}
`;
  },

  generateHomeCss: () => {
    return `/* Home Page Styles */
.home {
  padding: 1rem;
}

h1 {
  margin-top: 0;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 0.5rem 0;
}

a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
`;
  },

};

module.exports = StylesGenerator;
