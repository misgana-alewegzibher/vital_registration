const mongoose = require('mongoose');
mongoose.connect('localhost://playground/').then(()=>console.log("Connection is succeessful"))
.catch(()=>console.error("Couldn't connect to this due to ", err));