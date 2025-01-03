const mongoose = require('mongoose');
const express = require('express');
const Folder = require('../Schema/folder.Schema');
const Dashboard = require('../Schema/dashboard.Schema');
const User = require('./user');
const router = express.Router();
const authMiddleware = require('../Middleware/auth');
const checkDashboardAccess= require('../Middleware/checkDashboardAccess')
const checkEditMode = require('../Middleware/checkEditMode')




router.post('/create/:dashboardId', authMiddleware, checkDashboardAccess, checkEditMode, async (req, res) => {
    const { folderName } = req.body;
    try {
        const existingFolder = await Folder.findOne({ folderName, dashboardId: req.params.dashboardId });
        if (existingFolder) {
            return res.status(400).send({ error: 'Folder already exists' });
        }
        const folder = new Folder({ folderName, dashboardId: req.params.dashboardId, folderCreater: req.user.id });
        await folder.save();
        res.status(200).send(folder);
    } catch (error) {
        res.status(400).send(error);
    }
});


router.delete('/delete/:dashboardId/:id', authMiddleware, checkDashboardAccess, checkEditMode, async (req, res) => {
    try {
        const folder = await Folder.findOneAndDelete({ _id: req.params.id, dashboardId: req.params.dashboardId });
        if (!folder) {
            return res.status(404).send({ error: 'Folder not found' });
        }
        res.send(folder);
    } catch (error) {
        res.status(500).send(error);
    }
});


router.get('/:dashboardId', authMiddleware, checkDashboardAccess, async (req, res) => {
    try {
        const folders = await Folder.find({ dashboardId: req.params.dashboardId });
        res.send(folders);
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
});

module.exports = router;
