const mongoose = require('mongoose');
const express = require('express');
const Folder = require('../Schema/folder.Schema');
const Dashboard = require('../Schema/dashboard.Schema');
const User = require('./user');
const authMiddleware = require('../Middleware/auth');
const checkDashboardAccess= require('../Middleware/checkDashboardAccess')
const checkEditMode = require('../Middleware/checkEditMode')
const checkAccess = require('../Middleware/checkAcess')
const Form = require('../Schema/form.Schema');
const jwt = require('jsonwebtoken');
const FormResponse = require('../Schema/formResponse')


const router = express.Router();


// Create a new form
router.post('/create/:dashboardId/:id', authMiddleware,checkDashboardAccess,checkEditMode,async (req, res) => {
  const { formName, components } = req.body;
  //crete new form form name should be unique for a dashboard
  try {
    const existingForm = await Form.findOne({ formName, id: req.params.id });
    if (existingForm) {
      return res.status(409).json({ message: 'Form name already exists' });
    }
    const newForm = new Form({
      formName,
      components,
      id:req.params.id
    });
    await newForm.save();
    return res.status(200).json({ message: 'Form created successfully' });
    } catch (error) {
     return  res.status(500).json({ message: 'Error creating form' });
    }
  
  } );


//get all form data in json fromat
router.get('/get/:dashboardId/:id', authMiddleware,checkDashboardAccess,checkAccess,async (req, res) => {
  try {
    const forms = await Form.find({id:req.params.id});
    res.status(200).json({forms});
  } catch (error) {
    res.status(400).json({error});
  }
}
);




router.delete('/delete/:dashboardId/:id/:formId', authMiddleware,checkDashboardAccess,checkEditMode,async (req, res) => {
  try {
    const form= await Form.findOneAndDelete({_id:req.params.formId});
    
    if(!form){
      return res.status(404).send({error:'Form not found'});
    }
    res.status(200).json({form});
  } catch (error) {
    res.status(500).json({error});
    }
  }
);



//get form data by id
router.get('/getById/:dashboardId/:id/:formId', authMiddleware,checkDashboardAccess,checkAccess,async (req, res) => {
  try {
    const form= await Form.findById(req.params.formId);
    if(!form){
      return res.status(404).send({error:'Form not found'});
    }
    res.status(200).json({form});
  } catch (error) {
    res.status(400).json({error});
    }
  }
);


//update form data by id
router.put('/update/:dashboardId/:id/:formId', authMiddleware,checkDashboardAccess,checkEditMode,async (req, res) => {
  try {
    const form
    = await Form.findByIdAndUpdate(req.params.formId,req.body,{new:true});
    if(!form){
      return res.status(404).send({error:'Form not found'});
    }
    res.status(200).json({form});
  } catch (error) {
    res.status(400).json({error});
    }
    }
    );



    //create a endpoint to share the form to other by link 
    router.post('/share/:dashboardId/:id/:formId', authMiddleware,checkDashboardAccess,checkEditMode,async (req, res) => {
      try {
        const form = await Form.findById(req.params.formId);
        if(!form){
          return res.status(404).send({error:'Form not found'});
        }
        const token = jwt.sign({ formId: form._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const shareLink = `${process.env.FRONTEND_URL_FORM}/share/${token}`;
        res.status(200).json({shareLink});
        } catch (error) {
          console.log(error);
          res.status(400).json({error});
          }
          }
          );





//get form data by share link
router.get('/shared-form-data/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const form = await Form.findById(decoded.formId);
    if(!form){
      return res.status(404).send({error:'Form not found'});
    }
    res.status(200).json({form});
  } catch (error) {
   
    res.status(400).json({error});
    }
    }
    );






    


router.post('/submit-form/:id', async (req, res) => {
  try {
    const formId = req.params.id;
    const requestData = req.body;

   
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

   
    const responses = Object.keys(requestData).map((key) => ({
      componentId: key, 
      responseData: requestData[key],
    }));

   
    const newFormResponse = new FormResponse({
      formId,
      responses,
    });

    
    await newFormResponse.save();

    
    res.status(200).json(newFormResponse);
  } catch (error) {
    console.error('Error submitting form response:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.post("/form/view/:formId", async (req, res) => {
  try {
    const { formId } = req.params;
    await Form.findByIdAndUpdate(formId, { $inc: { views: 1 } });
    res.status(200).json({ message: "View recorded successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error recording view" });
  }
});






router.get('/form-details/:formId', async (req, res) => {
  try {
    const formId = req.params.formId;
    
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    
    const responseCount = await FormResponse.countDocuments({ formId });
    const responses = await FormResponse.find({ formId }).populate('formId');
    
    const componentTypes = [];
    const seenComponentIds = new Set();

    responses.forEach((response) => {
      response.responses.forEach((r) => {
        const component = form.components.id(r.componentId);
        if (component && component.componentType !== "Image" && component.componentType !== "Text") {
          if (!seenComponentIds.has(r.componentId.toString())) {
            componentTypes.push({
              
              componentType: component.componentType
            });
            seenComponentIds.add(r.componentId.toString());
          }
        }
      });
    });
    
    const allResponses = await FormResponse.find({ formId });
   
    const allResponsesData = allResponses.map((response) => {
      return response.responses.map((r) => r.responseData);
      });

    res.json({
      allResponses,
      views: form.views,
      responseCount,
      componentTypes,
      allResponsesData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


