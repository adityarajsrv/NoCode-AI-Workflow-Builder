const mongoose = require('mongoose');

const stackSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true
    },
    description: { 
        type: String, 
        default: ""
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true 
});

stackSchema.statics.getUserStacks = function(userId) {
    return this.find({ user: userId, isActive: true }).sort({ updatedAt: -1 });
};

module.exports = mongoose.model('Stack', stackSchema);