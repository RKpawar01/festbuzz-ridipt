const Fest = require('../../models/Fest/Fest.js');

exports.getAllFests = async (req, res) => {
  try {
    const fests = await Fest.find({ festStatus: 'Live' })
      .populate('adminId', 'firstname lastname email') // populate admin details
      .populate('updatedBy', 'firstname lastname email') // populate updater details
      .sort({ createdAt: -1 }); // latest first

    if (!fests || fests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No live fests found',
      });
    }

    res.status(200).json({
      success: true,
      count: fests.length,
      fests,
    });
  } catch (error) {
    console.error('Error fetching fests:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching fests',
    });
  }
};
