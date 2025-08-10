const mongoose = require('mongoose');

const ShowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    enum: ['teatro', 'circo', 'danza', 'musical'],
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  fundedAmount: {
    type: Number,
    default: 0
  },
  roi: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['funding', 'production', 'completed', 'cancelled'],
    default: 'funding'
  },
  artists: [{
    name: String,
    walletAddress: String,
    share: Number
  }],
  startDate: Date,
  endDate: Date,
  imageUrl: String,
  contractAddress: String
});

module.exports = mongoose.model('Show', ShowSchema);