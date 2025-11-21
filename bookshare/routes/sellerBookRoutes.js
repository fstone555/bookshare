const express = require('express');
const router = express.Router();
const sellerBookController = require('../controllers/sellerBookController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/books')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Seller routes
router.get('/', authMiddleware, authorizeRoles('seller'), sellerBookController.getSellerBooks);
router.post('/', authMiddleware, authorizeRoles('seller'), upload.array('images'), sellerBookController.createBook);
router.patch('/:id', authMiddleware, authorizeRoles('seller'), upload.array('images'), sellerBookController.updateBook);
router.delete('/:id', authMiddleware, authorizeRoles('seller'), sellerBookController.deleteBook);

module.exports = router;
