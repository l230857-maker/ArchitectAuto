const archiver = require('archiver');

const CodeArchiveService = {
  /**
   * Creates a ZIP archive containing generated code files
   * 
   * @param {Array} files - Array of file objects { path: string, content: string }
   * @param {Object} response - Express response object to stream ZIP to
   * @returns {Promise<void>}
   */
  createZip: (files, response) => {
    return new Promise((resolve, reject) => {
      // Set response headers for file download
      response.setHeader('Content-Type', 'application/zip');
      response.setHeader('Content-Disposition', 'attachment; filename="generated-code.zip"');

      // Create archive
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      // Handle archive errors
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        response.status(500).json({
          success: false,
          message: 'Failed to create ZIP archive',
          error: err.message,
        });
        reject(err);
      });

      // Pipe archive to response
      archive.pipe(response);

      // Add files to archive
      files.forEach((file) => {
        archive.append(file.content, { name: file.path });
      });

      // Handle response end
      response.on('end', () => {
        resolve();
      });

      // Finalize archive
      archive.finalize();
    });
  },
};

module.exports = CodeArchiveService;
