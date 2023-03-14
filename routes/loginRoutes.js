const express= require('express');
const md5 = require("md5");
const {User} = require('../models/userModel');
// const jUser = JSON.parse(User);
const router = express.Router();
const bodyParser = require("body-parser");


router.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );var logged = false;
router.post("/", function (req, res) {
  const email = req.body.email;
  const password = md5(req.body.password);
  
async function logger(){
    const usemail = await User.find({email:email}).sort().select({ email:1});
    console.log(usemail);
//   await User.findOne({ email: email }, function (err, foundUser) {
//     if (err) {
//       console.log(err);
//     } else {
//       if (foundUser) {
//         if (foundUser.password === password) {
//           if (foundUser.role == 'admin') {
//             logged = true;
//             // res.sendFile(__dirname + "/administer");
//             console.log(logged);
//             res.render('views/administer');
//           }

//           res.sendFile(__dirname + "/choice.html");
//         }
//       } else {
//         res.sendFile(__dirname + "/login.html");
//       }
//     }
//   });
}
logger();
}
);

module.exports = router;