const mongoose= require('mongoose')

async function db() {
    mongoose.connect('mongodb+srv://mishraabhayab5:finalProject@cluster0.pyoi5.mongodb.net/', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
}


module.exports= db;