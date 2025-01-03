const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    folderName: { type: String, required: true },
    dashboardId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dashboard',
        required: true
    },
    folderCreater:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})



module.exports=mongoose.model('Folder',folderSchema);