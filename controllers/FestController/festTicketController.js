const FestTicket = require('../../models/Ticket/FestTicketModel.js');

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

