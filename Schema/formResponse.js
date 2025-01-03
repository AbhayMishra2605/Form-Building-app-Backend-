const mongoose = require('mongoose');
const moment = require('moment');



const responseSchema = new mongoose.Schema({
  componentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  responseData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});


const formResponseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Form'
  },
  responses: {
    type: [responseSchema],
    required: true
  },
  submittedAt: { 
    type: String,
     default: () => moment().format('MMM DD, hh:mm A')
     }
});


const FormResponse = mongoose.model('FormResponse', formResponseSchema);

module.exports = FormResponse;
