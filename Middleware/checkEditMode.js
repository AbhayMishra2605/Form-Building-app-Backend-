





async function checkEditMode(req, res, next) {
    if (!req.hasEditAccess && req.dashboard.owner.toString() !== req.user.id.toString()) {
        return res.status(403).send({ error: 'You are not allowed to perform this action' });
    }
    next();
}


module.exports= checkEditMode;