const express = require('express');
const router = express.Router();
const { saveDraftEvent, publishEvent, getAllOrganizationEvents, getEventByIdForOrganization } = require('../../controllers/EventsController/eventController.js');
const protect = require('../../middlewares/authMiddleware.js');

router.get('/organization-events', protect, getAllOrganizationEvents);
router.get('/organization-events/:id', protect, getEventByIdForOrganization);
router.post('/save-draft', protect, saveDraftEvent); // create
router.put('/save-draft/:id', protect, saveDraftEvent); // update
router.post('/publish/:id', protect, publishEvent); // publish

module.exports = router;
