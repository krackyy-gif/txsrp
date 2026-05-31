const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    messageId:     String,
    channelId:     String,
    guildId:       String,
    prize:         String,
    winnersCount:  Number,
    endTime:       Date,
    participants:  [String],
    ended:         { type: Boolean, default: false },
});

module.exports = mongoose.model('Giveaway', schema);
