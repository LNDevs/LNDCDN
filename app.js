const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './data');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// Set up multer upload
const upload = multer({ storage: storage });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get("/upload", function (req, res) {
    res.sendFile(path.join(__dirname, 'public/upload.html'));
});

// Require cdnroutes.js file
const cdnRoutes = require('./routes/cdnroutes');
app.use('/cdn', cdnRoutes);

// Start the server
const port = 80;
app.listen(port, function () {
  console.log(`Server listening on port ${port}`);
});
