const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    caseNumber:  { type: Number, unique: true },
    type:        String,
    userId:      String,
    username:    String,
    guildId:     String,
    punishment:  String,
    rankName:    String,
    rankId:      String,
    reason:      String,
    notes:       String,
    issuedBy:    String,
    issuedById:  String,
    revoked:     { type: Boolean, default: false },
    timestamp:   { type: Date, default: Date.now },
});

const Case = mongoose.model('Case', schema);

async function nextCaseNumber() {
    const last = await Case.findOne().sort({ caseNumber: -1 });
    return (last?.caseNumber ?? 0) + 1;
}

module.exports = { Case, nextCaseNumber };
