const Fest = require('../models/Fest/Fest.js');

const updateExpiredFests = async () => {
  await Fest.updateMany(
    { endDate: { $lt: new Date() }, festStatus: { $ne: 'Past' } },
    { $set: { festStatus: 'Past' } }
  );
};

module.exports = updateExpiredFests;
