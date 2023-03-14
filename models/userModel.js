const mongoose = require('../databases');
const express = require('express');
const autoIncrement = require('mongoose-auto-increment');
app.use(express);
const userSchema = new mongoose.Schema({
    uid: Number,
    name: String,
    email: String,
    password: String,
    role: {
      type: String,
      default: 'users'
    }
  });
  userSchema.plugin(autoIncrement.plugin,
    {
      model: 'User', field: 'uid',
      startAt: 100, incrementedBy: 1
    })
  
const User = mongoose.model("User", userSchema);
module.exports=User;