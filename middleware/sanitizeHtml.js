const sanitizeHtml = require('sanitize-html');

// Function to sanitize data and disallowing HTML in input fields.
exports.sanitizeInputFields = (fields) => {
    return (req, res, next) => {
      fields.forEach(field => {
        if (req.body[field]) {
          req.body[field] = sanitizeHtml(req.body[field], {
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