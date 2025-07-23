const FestTicket = require('../../models/Ticket/FestTicketModel.js');

exports.createFestTicket = async (req, res) => {
  try {
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

    const ticket = new FestTicket({
      festId,
      ticketName,
      festFeeType,
      price,
      availableFromDate,
      availableTillDate,
      availableFromTime,
      endTime
    });

    const savedTicket = await ticket.save();
    res.status(201).json({
      success: true,
      data: savedTicket
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
