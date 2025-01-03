const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const userRoute = require('./Routes/user')
const bodyParser = require("body-parser");
const cors=require('cors');
const db= require('./config/connect')
const dashboardRoute= require('./Routes/dashboard')
const folderRoute = require('./Routes/folder')
const formRoute = require('./Routes/form')



const PORT = process.env.PORT || 3000;
app.use(cors());


app.use(express.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use('/api/user',userRoute);
app.use('/api/user',dashboardRoute);
app.use('/api/user',folderRoute);
app.use('/api/user',formRoute);

db().then(() => {
    console.log("Conected to the database");
}).catch((err) => {
    console.log("Error in connection");
});


app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "try.html"));
});

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})