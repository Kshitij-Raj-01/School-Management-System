const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure Storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists in root
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
      return res.status(400).send('No file uploaded');
  }
  // Return the path relative to server
  res.send(`/${req.file.path.replace(/\\/g, "/")}`);
});

module.exports = router;