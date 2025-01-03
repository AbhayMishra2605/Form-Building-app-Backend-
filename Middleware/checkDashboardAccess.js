
const mongoose = require('mongoose');


const Dashboard = require('../Schema/dashboard.Schema');






async function checkDashboardAccess(req, res, next) {
    try {
        const dashboard = await Dashboard.findById(req.params.dashboardId);
        if (!dashboard) {
            return res.status(404).send({ error: 'Dashboard not found' });
        }
        const sharedUser = dashboard.sharedUsers.find(user => user.user.toString() === req.user.id.toString());
        const hasViewAccess = sharedUser && (sharedUser.mode === 'edit' || sharedUser.mode === 'view');
        
        if (dashboard.owner.toString() !== req.user.id.toString() && !hasViewAccess) {
            return res.status(403).send({ error: 'Access denied' });
        }
        req.dashboard = dashboard;
        req.hasEditAccess = sharedUser && sharedUser.mode === 'edit';
        next();
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
}


module.exports=checkDashboardAccess;