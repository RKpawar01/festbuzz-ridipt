const Fest = require('../../models/Fest/Fest.js');
const updateExpiredFests = require('../../utils/updateFestStatus.js');

const validateFestInput = (body) => {
    const errors = [];

    if (!body.festName) errors.push('Fest Name is required');
    if (!body.festType) errors.push('Fest Type is required');
    if (!body.startDate) errors.push('Start Date is required');
    if (!body.endDate) errors.push('End Date is required');
    if (!body.mode || !['Online', 'Offline'].includes(body.mode)) errors.push('Mode must be Online or Offline');
    if (!body.aboutFest) errors.push('About Fest is required');
    if (!body.eligibilityCriteria) errors.push('Eligibility Criteria is required');
    if (!body.venue) errors.push('Venue is required');
    if (!body.state) errors.push('State is required');
    if (!body.city) errors.push('City is required');
    if (!body.collegeName) errors.push('College Name is required');
    if (!body.logo) errors.push('Logo is required');

    return errors;
};

exports.createFest = async (req, res) => {
  try {
    const errors = validateFestInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors
      });
    }

    const {
      festName,
      festType,
      visibility,
      startDate,
      endDate,
      websiteUrl,
      mode,
      aboutFest,
      eligibilityCriteria,
      venue,
      state,
      city,
      collegeName,
      instagramUrl,
      linkedinUrl,
      youtubeAftermovie,
      festStatus,
      sponsorNames,
      sponsorTitles
    } = req.body;

    // Extract files from multer
    const logo = req.files['logo']?.[0]?.path || '';
    const photos = req.files['photos']?.map(file => file.path) || [];
    const sponsorImages = req.files['sponsorImages']?.map(file => file.path) || [];

    // Parse sponsors (assumes same order in form-data arrays)
    let sponsors = [];
    if (sponsorNames && sponsorTitles && sponsorImages.length > 0) {
      const names = Array.isArray(sponsorNames) ? sponsorNames : [sponsorNames];
      const titles = Array.isArray(sponsorTitles) ? sponsorTitles : [sponsorTitles];

      sponsors = names.map((name, i) => ({
        sponsorName: name,
        sponsorTitle: titles[i] || '',
        sponsorImage: sponsorImages[i] || ''
      }));
    }

    const fest = await Fest.create({
      adminId: req.user._id,
      festName,
      festType,
      visibility,
      startDate,
      endDate,
      websiteUrl,
      mode,
      aboutFest,
      eligibilityCriteria,
      venue,
      state,
      city,
      collegeName,
      instagramUrl,
      linkedinUrl,
      youtubeAftermovie,
      logo,
      photos,
      sponsors,
      festStatus
    });

    return res.status(201).json({
      success: true,
      message: 'Fest created successfully',
      data: fest
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Fest creation failed',
      error: error.message
    });
  }
};

exports.getFests = async (req, res) => {
    try {
        await updateExpiredFests();

        const user = req.user;

        const adminIdToFetch = user.role === 'Admin' ? user._id : user.adminId;

        const fests = await Fest.find({ adminId: adminIdToFetch });

        return res.status(200).json({
            success: true,
            message: 'Fests retrieved successfully',
            data: fests
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch fests',
            error: error.message
        });
    }
};

exports.updateFest = async (req, res) => {
  try {
    const errors = validateFestInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors
      });
    }

    const user = req.user;
    const adminIdToMatch = user.role === 'Admin' ? user._id : user.adminId;

    // Build update object
    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
    };

    // ⬇️ Replace logo if new uploaded
    if (req.files['logo']) {
      updateData.logo = req.files['logo'][0].path;
    }

    // ⬇️ Replace full photos[] if new photos uploaded
    if (req.files['photos']) {
      updateData.photos = req.files['photos'].map(file => file.path);
    }

    // ⬇️ Rebuild sponsors[] if new sponsor images uploaded
    if (req.files['sponsorImages']) {
      const sponsorNames = Array.isArray(req.body.sponsorNames) ? req.body.sponsorNames : [req.body.sponsorNames];
      const sponsorTitles = Array.isArray(req.body.sponsorTitles) ? req.body.sponsorTitles : [req.body.sponsorTitles];
      const sponsorImages = req.files['sponsorImages'].map(file => file.path);

      updateData.sponsors = sponsorNames.map((name, i) => ({
        sponsorName: name,
        sponsorTitle: sponsorTitles[i] || '',
        sponsorImage: sponsorImages[i] || ''
      }));
    }

    const fest = await Fest.findOneAndUpdate(
      { _id: req.params.id, adminId: adminIdToMatch },
      updateData,
      { new: true, runValidators: true }
    );

    if (!fest) {
      return res.status(404).json({
        success: false,
        message: 'Fest not found or unauthorized'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Fest updated successfully',
      data: fest
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update fest',
      error: error.message
    });
  }
};
exports.deleteFest = async (req, res) => {
    try {
        const user = req.user;
        const adminIdToMatch = user.role === 'Admin' ? user._id : user.adminId;

        const fest = await Fest.findOneAndDelete({
            _id: req.params.id,
            adminId: adminIdToMatch
        });

        if (!fest) {
            return res.status(404).json({
                success: false,
                message: 'Fest not found or unauthorized'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Fest deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete fest',
            error: error.message
        });
    }
};

exports.changeFestStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = ['Draft', 'Live', 'Past'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid fest status. Must be one of: Draft, Live, Past.'
            });
        }

        const user = req.user;
        const adminIdToMatch = user.role === 'Admin' ? user._id : user.adminId;

        const fest = await Fest.findOneAndUpdate(
            { _id: req.params.id, adminId: adminIdToMatch },
            { festStatus: status },
            { new: true }
        );

        if (!fest) {
            return res.status(404).json({
                success: false,
                message: 'Fest not found or unauthorized.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Fest status updated successfully.',
            data: fest
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update fest status.',
            error: error.message
        });
    }
};

