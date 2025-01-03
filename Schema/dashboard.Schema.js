const mongoose = require('mongoose');



    const DashboardSchema = new mongoose.Schema({
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        sharedUsers: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                mode: { type: String, enum: ['edit', 'view'], required: true },
            },
        ],
    });


    


    module.exports= mongoose.model('Dashboard',DashboardSchema);

    
