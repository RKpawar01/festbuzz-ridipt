const FestTicket = require('../../models/Ticket/FestTicketModel.js');
const Fest = require('../../models/Fest/Fest.js');

// Validation function
const validateTicketInput = (body) => {
  const errors = [];

  if (!body.festId) errors.push('Fest ID is required');
  if (!body.ticketName) errors.push('Ticket Name is required');
  if (!body.festFeeType || !['Paid', 'Free'].includes(body.festFeeType)) {
    errors.push('Fest Fee Type must be Paid or Free');
  }
  if (body.festFeeType === 'Paid' && (body.price === undefined || isNaN(body.price))) {
    errors.push('Price is required and must be a number for Paid tickets');
  }
  if (body.availableFromDate && body.availableTillDate) {
    const from = new Date(body.availableFromDate);
    const till = new Date(body.availableTillDate);
    if (till <= from) {
      errors.push('availableTillDate must be greater than availableFromDate');
    }
  }

  return errors;
};

// Controller to create a ticket
exports.createFestTicket = async (req, res) => {
  try {
    const errors = validateTicketInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors
      });
    }

    const {
      festId,
      ticketName,
      festFeeType,
      price,
      availableFromDate,
      availableTillDate,
      availableFromTime,
      endTime
    } = req.body;

    const ticketData = {
      festId,
      ticketName,
      festFeeType,
      availableFromDate,
      availableTillDate,
      availableFromTime,
      endTime,
      createdBy: req.user._id
    };

    if (festFeeType === 'Paid') {
      ticketData.price = price;
    }

    const ticket = await FestTicket.create(ticketData);

    return res.status(201).json({
      success: true,
      message: 'Fest ticket created successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error creating fest ticket:', error);
    return res.status(500).json({
      success: false,
      message: 'Fest ticket creation failed',
      error: error.message
    });
  }
};

// Controller to get tickets of a fest (org scoped)
exports.getfestticket = async (req, res) => {
  try {
    const { festId } = req.params;

    const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;
    const fest = await Fest.findOne({ _id: festId, adminId });
    if (!fest) {
      return res.status(404).json({ success: false, message: 'Fest not found or unauthorized' });
    }

    const tickets = await FestTicket.find({ festId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching fest tickets:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch fest tickets', error: error.message });
  }
};

// Controller to update a ticket (org scoped)
exports.updateticket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await FestTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;
    const fest = await Fest.findOne({ _id: ticket.festId, adminId });
    if (!fest) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this ticket' });
    }

    // Validate incoming fields (allow partial updates)
    const body = req.body || {};
    if (body.festFeeType && !['Paid', 'Free'].includes(body.festFeeType)) {
      return res.status(400).json({ success: false, message: 'festFeeType must be Paid or Free' });
    }
    if (body.festFeeType === 'Paid' && body.price !== undefined && isNaN(body.price)) {
      return res.status(400).json({ success: false, message: 'price must be a number for Paid tickets' });
    }
    if (body.availableFromDate && body.availableTillDate) {
      const from = new Date(body.availableFromDate);
      const till = new Date(body.availableTillDate);
      if (!(till > from)) {
        return res.status(400).json({ success: false, message: 'availableTillDate must be greater than availableFromDate' });
      }
    }

    // Apply updates
    const updatable = ['ticketName', 'festFeeType', 'price', 'availableFromDate', 'availableTillDate', 'availableFromTime', 'endTime'];
    updatable.forEach((key) => {
      if (body[key] !== undefined) {
        ticket[key] = body[key];
      }
    });

    // If festFeeType changed to Free, clear price
    if (ticket.festFeeType === 'Free') {
      ticket.price = undefined;
    }

    await ticket.save();

    return res.status(200).json({ success: true, message: 'Fest ticket updated successfully', data: ticket });
  } catch (error) {
    console.error('Error updating fest ticket:', error);
    return res.status(500).json({ success: false, message: 'Fest ticket update failed', error: error.message });
  }
};

// Controller to delete a ticket (org scoped)
exports.deleteticket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await FestTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;
    const fest = await Fest.findOne({ _id: ticket.festId, adminId });
    if (!fest) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this ticket' });
    }

    await FestTicket.deleteOne({ _id: ticketId });

    return res.status(200).json({ success: true, message: 'Fest ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting fest ticket:', error);
    return res.status(500).json({ success: false, message: 'Fest ticket deletion failed', error: error.message });
  }
};

