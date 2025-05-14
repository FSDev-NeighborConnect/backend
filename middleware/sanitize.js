const sanitizeHtml = require('sanitize-html');

// Function to sanitize data and disallowing HTML in input fields.
function sanitizeInputFields(fields) {
  return function (req, res, next) {
    fields.forEach(field => {
      const value = req.body[field];
      if (typeof value === 'string') {
        req.body[field] = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
          allowedSchemes: [],
          allowProtocolRelative: false
        });
      }
    });
    next();
  };
};

function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return;

  for (const key of Object.keys(obj)) {
    // Removes dangerous keys starting with $ or containing .
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else {
      sanitizeObject(obj[key]); // Recurse into nested objects
    }
  }
}

function sanitizeRequest(req, res, next) {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  // req.query skipped, is read-only in Express 5
  next();
}

module.exports = { sanitizeInputFields, sanitizeRequest };