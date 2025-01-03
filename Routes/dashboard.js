const express = require('express');
const router= express.Router();
const mongoose = require('mongoose');
const Dashboard = require('../Schema/dashboard.Schema')
const User = require("../Schema/user.Schema");
const authMiddleware = require('../Middleware/auth')
const jwt =require('jsonwebtoken');





router.post('/invite-email', authMiddleware, async (req, res) => {
  let { email, dashboardId, mode } = req.body;

  if(mode ==='Edit'|| mode ==='View'){
    mode=mode.toLowerCase();
  }

  try {
    
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: "User does not exist" });
    }

    
    const dashboard = await Dashboard.findById(dashboardId);
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }

    
    const isAlreadyShared = dashboard.sharedUsers.some(
      (sharedUser) => sharedUser.user.toString() === userToInvite._id.toString()
    );
    if (isAlreadyShared) {
      return res.status(400).json({ message: "User already shared with this dashboard" });
    }

    
    dashboard.sharedUsers.push({ user: userToInvite._id, mode });
    await dashboard.save();

    return res.status(200).json({ message: "User invited successfully" });
  } catch (err) {
    console.error("Error inviting user by email:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});






router.post('/generate-invite-link', authMiddleware, async (req, res) => {
  const { dashboardId, mode } = req.body;

  try {
     
      const dashboard = await Dashboard.findById(dashboardId);
      if (!dashboard) {
          return res.status(404).json({ message: "Dashboard not found" });
      }

      
      const payload = { dashboardId, mode };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      
      const inviteLink = `${process.env.FRONTEND_URL}/invite/${token}`;

      return res.status(200).json({ inviteLink });
  } catch (err) {
      console.error("Error generating invite link:", err);
      res.status(500).json({ message: "Internal Server Error" });
  }
});








router.get('/shared-dashboard/:dashboardId', authMiddleware, async (req, res) => {
    const { dashboardId } = req.params;
  
    try {
      const dashboard = await Dashboard.findById(dashboardId).populate('owner');
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
  
      
      if (dashboard.sharedUsers.some(sharedUser => sharedUser.user.equals(req.user.id) && sharedUser.mode === 'view')) {
        return res.redirect(`/dashboard/view/${dashboardId}`);
      }
      if (dashboard.sharedUsers.some(sharedUser => sharedUser.user.equals(req.user.id) && sharedUser.mode === 'edit')) {
        return res.redirect(`/dashboard/edit/${dashboardId}`);
      }
  
      res.status(403).json({ message: "No permission to access this dashboard" });
    } catch (err) {
      console.error("Error accessing shared dashboard:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  


  router.get('/user-dashboards', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

       
        const [ownDashboard, user] = await Promise.all([
            Dashboard.findOne({ owner: userId }).select('_id'),
            User.findById(userId).select('name')
        ]);

        if (!ownDashboard || !user) {
            return res.status(404).json({ message: "User or own dashboard not found" });
        }

        const ownDashboardId = ownDashboard._id;
        const ownerName = user.name;

        
        const sharedDashboards = await Dashboard.find({
            'sharedUsers.user': userId
        }).select('_id owner sharedUsers');

       
        const sharedDashboardsDetails = await Promise.all(
            sharedDashboards.map(async (dashboard) => {
                const sharedUsers = dashboard.sharedUsers.filter(user => user.user.toString() === userId);
                const owner = await User.findById(dashboard.owner).select('name');

                return {
                    id: dashboard._id,
                    ownerId: dashboard.owner,
                    ownerName: owner?.name || "Unknown",
                    modes: sharedUsers.map(user => user.mode)
                };
            })
        );
      return res.status(200).json({
            ownDashboardId,
            ownerName,
            sharedDashboards: sharedDashboardsDetails
        });
    } catch (err) {
        console.error("Error fetching dashboards:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



router.get('/shared-dashboardById/:id', async (req, res) => {
  try {
    const dashboardId = req.params.id;
    
    const dashboard = await Dashboard.findById(dashboardId).select('owner');
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }

    const owner = await User.findById(dashboard.owner).select('name');
    return res.status(200).json({
      ownerName: owner.name
    });
    } catch (err) {
    console.error("Error fetching owner name:", err);
    return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);





router.get('/validate-invite/:token', async (req, res) => {
  const { token } = req.params;

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { dashboardId, mode } = decoded;

   
    const dashboard = await Dashboard.findById(dashboardId);
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }

   
    res.status(200).json({
      valid: true,
      dashboard,
      mode, 
    });
  } catch (err) {
    console.error("Token validation error:", err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});










  module.exports=router;