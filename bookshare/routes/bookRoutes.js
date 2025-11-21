const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authMiddleware } = require('../middleware/authMiddleware');
const sellerBookController = require('../controllers/sellerBookController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Book CRUD
router.post('/', authMiddleware, upload.array('images'), bookController.create);
router.get('/', bookController.list);              // ดึงหนังสือทั้งหมด (Admin หรือ Public)
router.get('/:id', bookController.get);
router.put('/:id', authMiddleware, upload.array('images'), bookController.update);
router.delete('/:id', authMiddleware, bookController.remove);

// Seller books
router.get('/seller', authMiddleware, sellerBookController.getSellerBooks); // ดึงของ seller เอง

module.exports = router;
