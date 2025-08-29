const Event = require('../../models/Events/Event.js');
const User = require('../../models/Organization/User.js')

exports.getAllOrganizationEvents = async (req, res) => {
    try {
        const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;

        const events = await Event.find({ adminId });

        res.status(200).json({ success: true, count: events.length, events });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getEventByIdForOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;

        const event = await Event.findOne({ _id: id, adminId });

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found or unauthorized access' });
        }

        res.status(200).json({ success: true, event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.saveDraftEvent = async (req, res) => {
    try {
        const { id } = req.params; // for update
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const eventData = {
            ...req.body,
            createdBy: req.user._id,
            creatorRole: req.user.role,
            adminId: req.user.role === 'Admin' ? req.user._id : req.user.adminId,
            status: 'Draft'
        };

        let event;

        if (id) {
            event = await Event.findByIdAndUpdate(id, eventData, { new: true, upsert: true });
        } else {
            event = await Event.create(eventData);
        }

        res.status(200).json({ success: true, event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.publishEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const requiredFields = [
            'eventName', 'eventType', 'visibility',
            'startDate', 'endDate', 'location', 'venueName',
            'ticketName', 'eventFeeType'
        ];

        const missingField = requiredFields.find(field => !event[field]);
        if (missingField) {
            return res.status(400).json({ message: `Missing required field: ${missingField}` });
        }

        if (event.endDate <= event.startDate) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        if (Array.isArray(event.evaluationParameters) && event.evaluationParameters.length > 0) {
            const totalWeight = event.evaluationParameters.reduce((sum, param) => sum + param.weightage, 0);
            if (totalWeight !== 100) {
                return res.status(400).json({ message: 'Total parameter weightage must be 100%' });
            }
        }

        event.status = 'Live';
        await event.save();

        res.status(200).json({ success: true, message: 'Event published successfully', event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;

        // Find and delete event that belongs to this organization (adminId check is important)
        const event = await Event.findOneAndDelete({ _id: id, adminId });

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found or unauthorized access' });
        }

        res.status(200).json({ success: true, message: 'Event deleted successfully', event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};





