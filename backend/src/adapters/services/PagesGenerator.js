const PagesGenerator = {
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

  generate: (classes = []) => {
    const files = [];

    try {
      const homeContent = PagesGenerator.generateHome(classes);
      files.push({
        path: 'frontend/src/pages/Home.jsx',
        content: homeContent,
      });
    } catch (error) {
      console.error('Error generating Home.jsx:', error.message);
    }

    return files;
  },

  generateHome: (classes = []) => {
    const classNames = classes.map(cls => PagesGenerator.toPascalCase(cls.name));
    const moduleList = classNames
      .map(name => {
        const kebabName = PagesGenerator.toKebabCase(name);
        return `        <li><Link to="/${kebabName}">${name}</Link></li>`;
      })
      .join('\n');

    return `import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Available Modules</h1>
      <ul>
${moduleList}
      </ul>
    </div>
  );
}

export default Home;
`;
  },

  generateList: (className, cls) => {
    const kebabName = PagesGenerator.toKebabCase(className);
    const variableName = className.charAt(0).toLowerCase() + className.slice(1);

    return `import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ${className}List() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(\`\${import.meta.env.VITE_API_URL}/${kebabName}\`, {
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('token')}\`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch ${className}');
      const data = await response.json();
      setItems(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching ${className}:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this ${className}?')) return;

    try {
      const response = await fetch(\`\${import.meta.env.VITE_API_URL}/${kebabName}/\${id}\`, {
        method: 'DELETE',
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('token')}\`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete ${className}');
      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error deleting ${className}:', err);
      alert('Failed to delete ${className}');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="list-container">
      <div className="list-header">
        <h1>${className} List</h1>
        <Link to="/${kebabName}/create" className="btn-create">
          + Create New ${className}
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>No ${className} records found</p>
          <Link to="/${kebabName}/create" className="btn-primary">
            Create the first one
          </Link>
        </div>
      ) : (
        <table className="items-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item._id}</td>
                <td>
                  {JSON.stringify(item).substring(0, 100)}...
                </td>
                <td>
                  <Link to={\`/${kebabName}/\${item._id}/edit\`} className="btn-edit">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ${className}List;
`;
  },

  generateForm: (className, cls) => {
    const kebabName = PagesGenerator.toKebabCase(className);
    const variableName = className.charAt(0).toLowerCase() + className.slice(1);

    return `import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function ${className}Form() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await fetch(\`\${import.meta.env.VITE_API_URL}/${kebabName}/\${id}\`, {
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('token')}\`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch ${className}');
      const data = await response.json();
      setFormData(data.data || {});
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching ${className}:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const method = id ? 'PUT' : 'POST';
      const endpoint = id
        ? \`\${import.meta.env.VITE_API_URL}/${kebabName}/\${id}\`
        : \`\${import.meta.env.VITE_API_URL}/${kebabName}\`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('token')}\`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save ${className}');
      alert(\`${className} \${id ? 'updated' : 'created'} successfully!\`);
      navigate('/${kebabName}');
    } catch (err) {
      console.error('Error saving ${className}:', err);
      alert(\`Error: \${err.message}\`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>{id ? 'Edit' : 'Create'} ${className}</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="item-form">
        <div className="form-group">
          <label>Note:</label>
          <p>This is a placeholder form. Customize the fields based on your ${className} attributes.</p>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            placeholder="Add your notes here..."
            rows="6"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitting} className="btn-submit">
            {submitting ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/${kebabName}')}
            className="btn-cancel"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ${className}Form;
`;
  },
};

module.exports = PagesGenerator;
