const mongoose = require('mongoose');

// Define the schema for a single component
const componentSchema = new mongoose.Schema({
  componentType: {
    type: String,
    required: true,
    enum: ["Text", "Image", "InputText", "InputNumber", "InputEmail", "InputPhone", "InputDate", "InputRating", "SubmitButton"]
  },
  componentData: {
    type: mongoose.Schema.Types.Mixed, // Mixed type to allow flexible data structure
    
  }
});

// Define the schema for the form
const formSchema = new mongoose.Schema({
  formName: {
    type: String,
    required: true
  },
 
  components: {
    type: [componentSchema], // Array of componentSchema objects
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  id:{
    type:mongoose.Schema.Types.ObjectId,
    required:true
  },
  views: { type: Number, default: 0 },
});

// Middleware to update the `updatedAt` field before saving
formSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create the Mongoose model
const Form = mongoose.model('Form', formSchema);

module.exports = Form;