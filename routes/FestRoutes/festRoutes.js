const express = require('express');
const router = express.Router();
const { createFest, getFests, updateFest, deleteFest, changeFestStatus } = require('../../controllers/FestController/festController.js');
const protect = require('../../middlewares/authMiddleware.js');
const checkPermission = require('../../middlewares/checkPermission.js');
const upload = require('../../middlewares/upload.js');

// Only Admin can create/update/delete fest
router.post('/', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
    { name: 'sponsorImages', maxCount: 10 }
]), protect, checkPermission('/api/fest'), createFest);
router.get('/', protect, checkPermission('/api/fest'), getFests);
router.patch('/:id', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
    { name: 'sponsorImages', maxCount: 10 }
]),
    protect, checkPermission('/api/fest'), updateFest);
router.delete('/:id', protect, checkPermission('/api/fest'), deleteFest);
router.patch('/:id/status', protect, checkPermission('/api/fest'), changeFestStatus);
module.exports = router;
