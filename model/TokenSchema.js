const mongoose = require('mongoose');
require('../model/ranstandSchema')

const resettokenSchema = new mongoose.Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
    resettoken: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: "1h" },
    });
    
    
    module.exports = mongoose.model('passwordResetToken', resettokenSchema);