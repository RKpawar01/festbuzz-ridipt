const Event = require('../../models/Events/Event.js');

exports.getEventsByFestId = async (req, res) => {
  try {
    const { festId } = req.params;

    const events = await Event.find({ fest: festId, status: 'Live' })
      .populate('createdBy', 'firstname lastname email') // populate event creator
      .populate('adminId', 'firstname lastname email')   // populate admin
      .sort({ createdAt: -1 });

    if (!events || events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No live events found for this fest',
      });
    }

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events',
    });
  }
};
