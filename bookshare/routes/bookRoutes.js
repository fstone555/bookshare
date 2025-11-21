const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const sellerBookController = require('../controllers/sellerBookController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
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

/* --------------------------
   Seller routes
-------------------------- */
router.get(
  '/seller',
  authMiddleware,
  authorizeRoles('seller'),
  sellerBookController.getSellerBooks
);

router.post(
  '/seller',
  authMiddleware,
  authorizeRoles('seller'),
  upload.array('images'),
  sellerBookController.createBook
);

router.patch(
  '/seller/:id',
  authMiddleware,
  authorizeRoles('seller'),
  upload.array('images'),
  sellerBookController.updateBook
);

router.delete(
  '/seller/:id',
  authMiddleware,
  authorizeRoles('seller'),
  sellerBookController.deleteBook
);

/* --------------------------
   Public routes
-------------------------- */
router.get('/', bookController.list);
router.get('/:id', bookController.get);

router.post(
  '/',
  authMiddleware,
  upload.array('images'),
  bookController.create
);

router.put(
  '/:id',
  authMiddleware,
  upload.array('images'),
  bookController.update
);

// ❌ ลบบรรทัดนี้หากคุณมีอยู่
// router.patch('/:id', bookController.update); ← ทำให้ error

router.delete(
  '/:id',
  authMiddleware,
  bookController.remove
);

module.exports = router;
