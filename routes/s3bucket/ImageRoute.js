const express = require('express');
const multer = require('multer');
const { uploadImage, getPresignedUrls,editImages } = require('../../controllers/s3bucket/ImageController.js');
const protect = require('../../middlewares/authMiddleware.js');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); 

router.post('/upload', protect,upload.array('images', 25), uploadImage);

router.get('/presigned-urls', getPresignedUrls);

router.put('/edit', protect, upload.array('images', 5), editImages);


module.exports = router;