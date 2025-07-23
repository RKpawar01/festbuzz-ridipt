const mongoose = require('mongoose');

const festTicketSchema = new mongoose.Schema({
  festId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fest',
    required: true
  },
  ticketName: {
    type: String,
    required: true
  },
  festFeeType: {
    type: String,
    enum: ['Paid', 'Free'],
    required: true
  },
  price: {
    type: Number,
    required: function () {
      return this.festFeeType === 'Paid';
    }
  },
  availableFromDate: {
    type: Date
  },
  availableTillDate: {
    type: Date,
    validate: {
      validator: function (value) {
        if (this.availableFromDate && value) {
          return value > this.availableFromDate;
        }
        return true;
      },
      message: 'Ticket availableTillDate must be greater than availableFromDate.'
    }
  },
  availableFromTime: {
    type: String
  },
  endTime: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('FestTicket', festTicketSchema);
