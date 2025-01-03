const Dashboard = require('../Schema/dashboard.Schema');
const Folder = require('../Schema/folder.Schema');


const checkAccess = async (req, res, next) => {
  try {
      const id = req.params.id;
      
     
      const dashboard = await Dashboard.findById(id);
        const folder = await Folder.findById(id);
        if (!dashboard && !folder) {
            return res.status(404).json({ message: "Dashboard or Folder not found" });
            }
            next();
  }catch(err){
    console.log(err);
   return res.status(500).json({message:"Internal Server Error"});
  }
};



module.exports=checkAccess;