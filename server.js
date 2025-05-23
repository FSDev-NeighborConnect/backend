// Main backend server file
const connectDb = require('./config/db');
require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const express = require('express');
const path = require('path');
const { sanitizeRequest } = require('./middleware/sanitize');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

//Addition of controllers
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const errorHandler = require('./middleware/errorHandler');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const swaggerDocument = YAML.load('./docs/swagger.yaml');

if (process.env.ENABLE_API_DOCS === 'true') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.set('trust proxy', 1);  // needed for secure cookies in deployment

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_DEVPREVIEW_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow no-origin requests (e.g. form POSTs, redirects)
    // Safe due to exhaustive auth middleware & security checks,
    // all sensitive actions require JWT + CSRF validation, etc.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn('Blocked CORS request from:', origin);
    return callback(null, false);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options(/^\/api\/.*/, cors(corsOptions));

//Middleware
app.use(express.json());
app.use(sanitizeRequest); //protect from NoSQL injection by removing '$' and '.'
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); //Added extended true to get neat & clean java objects from arrays


app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Server running.' });
})
//  Uncomment it
// Provide the location of files to browser like index.html, logo.png, main.js etc.
// app.use(express.static(path.join(__dirname, '../client/build')));

app.use('/api', authRoutes); // routes start with /api
// Uncomment it as it is requred.
// For all other pages just get index.html. Everything else will be handeled by React.
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });

// registers the function into Express’s internal middleware system.
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  connectDb().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  });
}
module.exports = app;