const express = require("express");
const router = express.Router();
const User = require("../Schema/user.Schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const authMiddleware = require('../Middleware/auth')
const Dashboard = require('../Schema/dashboard.Schema')



router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  
  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
      return res.status(400).json({ message: "User already exists" });
  }

  try {
    
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

     
      const user = await User.create({
          name,
          email,
          password: hashedPassword,
      });

     
      const dashboard = await Dashboard.create({
          owner: user._id,
      });

      const payload = {
        id: user._id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
      return res.status(200).json({ 
          message: "User and dashboard created successfully", 
          token:token,
          dashboardId: dashboard._id,
          
      });

  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error in creating user or dashboard" });
  }
});




router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Wrong username or password" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Wrong username or password" });
    }
    const payload = {
        id: user._id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return res.status(200).json({ token });
})


router.put('/edituser', authMiddleware, async (req, res) => {
  const { name, email, password, newPassword } = req.body;

  try {
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      
      if (!name && !email && !password && !newPassword) {
          return res.status(400).json({
              message: "No data provided to update. Please provide at least one field to update."
          });
      }

      
      if (password || newPassword) {
          if (!password || !newPassword) {
              return res.status(400).json({
                  message: "Both current password and new password are required to update the password"
              });
          }

         
          const isPasswordCorrect = await bcrypt.compare(password, user.password);
          if (!isPasswordCorrect) {
              return res.status(401).json({ message: "Invalid current password" });
          }

         
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(newPassword, salt);
         
          
          
         
          user.password = hashedPassword;
      }

      
      const updatedFields = {};
      if (name) updatedFields.name = name;
      if (email) updatedFields.email = email;

      
      if (password && newPassword) {
          updatedFields.password = user.password;
      }

      
     

      
      const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedFields, { new: true });

      if (updatedUser) {
          
        const payload = {
          id: user._id,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      return res.status(200).json({ token });
      } else {
          return res.status(500).json({ message: "Failed to update user" });
      }
  } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ message: "Internal Server Error" });
  }
});

  

router.get('/data',(req,res)=>{
   
    User.find().then((data)=>{
        return res.json(data);
        }).catch((err)=>{
            res.status(400).json({message:"Error has come"});
            })
})
module.exports = router;