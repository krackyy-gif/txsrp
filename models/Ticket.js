const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userId:      String,
    username:    String,
    channelId:   String,
    messageId:   String,
    ticketId:    String,
    type:        String,
    status:      { type: String, default: 'open' },
    claimedBy:   { type: String, default: null },
    claimStatus: { type: String, default: 'unclaimed' },
    closedBy:    { type: String, default: null },
    closeReason: { type: String, default: null },
    createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ticket', schema);
