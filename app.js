require("dotenv").config();
const {
  Buffer
} = require('node:buffer');
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
var fs = require('fs-extra');
const dotenv = require("dotenv");
const morgan = require("morgan");
const md5 = require("md5");
const puppeteer = require('puppeteer');
const alert = require('alert');

//const popup = require("popup-prompt");


// var popup = require('popups');

// let pdf = require("html-pdf");

const {
  pid
} = require("process");

const app = express();

dotenv.config({
  path: "config.env"
});
const PORT = process.env.PORT || 8080;
app.use(morgan("tiny"));

app.use(express.static(__dirname));
app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/css", express.static(path.resolve(__dirname, "assets/js")));
app.use(express.static(path.resolve(__dirname, "/selfChoice/assets/css")));


app.use("/css", express.static(path.resolve(__dirname, "images")));

app.use(express.static(__dirname));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname));
var connection = mongoose.connect("mongodb://127.0.0.1:27017/kebelleDb", {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  uid: Number,
  name: String,
  email:
  { type: String, 
    require: true,
  },
  password: String,
  gender: String,
  hasTookBirthCert: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: 'users'
  },
  stillAlive: {
    type: Boolean,
    default: true
  },
  forChildren: [{
    childId: Number,
    gender: String,
  }],
  forFamily: [{
    familyId: String
  }],
  user_reg_date: {
    type: Date,
    default: Date.now(),
  }

});

const childSchema = new mongoose.Schema({
  familyId: Number,
  uid: Number,
  name: String,
  gender: String,
  age: Number,
  isStillAlive: Boolean,

});

const birthSchema = new mongoose.Schema({
  uid: Number,
  name: String,
  fathers_name: String,
  grand_fathers_name: String,
  mothers_full_name: String,
  place_or_country_of_birth: String,
  region_or_city_adminstration: String,
  zone_or_city_adminstration: String,
  gender: String,
  citizenship_status: String,
  date_of_birthday: Date,
  date_of_birthday_registration: Date,
  status: String,
  forHisChild: Boolean,
  userImgF: String,
  userImgB: String,

});


const marriageSchema = new mongoose.Schema({
  uid: Number,
  wifes_name: String,
  wifes_fathers_name: String,
  wifes_grand_fathers_name: String,
  husbands_name: String,
  husbands_fathers_name: String,
  husbands_grand_fathers_name: String,
  place_of_marriage: String,
  place_of_marriage_registration: String,
  wifes_citizenship_status: String,
  husbands_citizenship_status: String,
  wifes_birthday: Date,
  husbands_birthday: Date,
  date_of_marriage: Date,
  date_of_marriage_registration: Date,

  status: String,
  mrgUserImgF: String,
  mrgUserImgB: String,

});

const divorceSchema = new mongoose.Schema({
  uid: Number,
  ex_wifes_name: String,
  ex_wifes_fathers_name: String,
  ex_wifes_grand_fathers_name: String,
  ex_husbands_name: String,
  ex_husbands_fathers_name: String,
  ex_husbands_grand_fathers_name: String,
  place_of_divorce_dissolved: String,
  place_of_divorce_registration: String,
  ex_wifes_citizenship_status: String,
  ex_husbands_citizenship_status: String,
  ex_wifes_birthday: Date,
  ex_husbands_birthday: Date,
  date_of_divorce: Date,
  status: String,
  dvcUserImgF: String,
  dvcUserImgB: String,

});

const deathSchema = new mongoose.Schema({
  uid: String,
  familyId: Number,
  anotherCertId: Number,
  deceased_name: String,
  fathers_name: String,
  grand_fathers_name: String,
  title_of_the_deceased: String,
  place_of_death: String,
  gender: String,
  citizenship_status: String,
  date_of_death: Date,
  date_of_death_registration: Date,
  status: String,

});

var multer = require('multer');
const {
  encode
} = require("node:punycode");
const {
  ifError
} = require("node:assert");
const { exit } = require("node:process");
var brthstorage = multer.diskStorage({

  destination: (req, file, cb) => {
    if (file.fieldname === 'bUserImg') {
      cb(null, 'uploads/idpic/frontid');

    }
    if (file.fieldname === 'bUserImg2') {
      cb(null, 'uploads/idpic/backid');
    }

  },
  filename: (req, file, cb) => {
    if (file.fieldname === 'bUserImg') {
      cb(null, 'bfrontid_' + Date.now() + '_' + file.originalname);

    }
    if (file.fieldname === 'bUserImg2') {
      cb(null, 'bbackid-' + Date.now() + '-' + file.originalname);
    }

  }
});

var mrgStorage = multer.diskStorage({

  destination: (req, file, cb) => {
    if (file.fieldname === 'mrgUserImg') {
      cb(null, 'uploads/mrgpic/frontid');

    }
    if (file.fieldname === 'mrgUserImg2') {
      cb(null, 'uploads/mrgpic/backid');
    }

  },
  filename: (req, file, cb) => {
    if (file.fieldname === 'mrgUserImg') {
      cb(null, 'mrgfrontid_' + Date.now() + '_' + file.originalname);

    }
    if (file.fieldname === 'mrgUserImg2') {
      cb(null, 'mrgbackid-' + Date.now() + '-' + file.originalname);
    }

  }
});

const mrgUpload = multer({
  storage: mrgStorage,
  limits: {
    fileSize: 1024 * 1024 * 10
  },
  fileFilter: (req, file, cb) => {
    checkFileTypeMrg(file, cb);
  }
});

const upload = multer({
  storage: brthstorage,
  limits: {
    fileSize: 1024 * 1024 * 10
  },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

function checkFileTypeMrg(file, cb) {
  if (file.fieldname === "mrgUserImg" || file.fieldname === "mrgUserImg2") {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
}

function checkFileType(file, cb) {
  if ((file.fieldname === "bUserImg" || file.fieldname === "bUserImg2")) {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
}

const User = new mongoose.model("User", userSchema);
const Child = new mongoose.model("Child", childSchema);
const admin = new mongoose.model("admin", userSchema);
const birth_info = new mongoose.model("birth_info", birthSchema);
const marriage_info = new mongoose.model("marriage_info", marriageSchema);
const divorce_info = new mongoose.model("divorce_info", divorceSchema);
const death_infos = new mongoose.model("death_infos", deathSchema);

var logged = false;


app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get("/", function (req, res) {

  res.sendFile(__dirname + "/sign_up.html");
});

function getNextId() {
  const userMax = User.find({}).sort({
    uid: -1
  }).limit(1).select({
    uid: 1
  });
  return userMax;
}

app.post("/sign_up", async function (req, res) {

  var max_id = 100;
  const uData = await User.find({}).sort({
    uid: -1
  }).limit(1).select({
    uid: 1
  });
  var uMaxId = 100;
  uData.forEach(element => {
    uMaxId = element.uid;
  });

  var cMaxId = 100;
  cData = await Child.find({}).sort({
    uid: -1
  }).limit(1).select({
    uid: 1
  });
  cData.forEach(element => {
    cMaxId = element.uid;
  });

  if (cMaxId != null && uMaxId != null) {
    if (cMaxId > uMaxId) {
      max_id = cMaxId;
    } else {
      max_id = uMaxId;
    }
  }
  var existEmail = await User.find().select({email:1});
  console.log(existEmail);
  var exist = false;
  existEmail.forEach(element => {
    console.log(element.email);
    if(element.email ===req.body.email ){
    exist = true;
    }
  });

  console.log("Here is max id: ", max_id);
  console.log(req.body.email);
  console.log(exist);
if(exist === false){
  const newUser = new User({
    uid: max_id + 1,
    name: req.body.username,
    email: req.body.email,
    gender: req.body.gender,
    password: md5(req.body.password),
  });

  newUser.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname + "/login.html");

      // newUserInfo =await User.find({uid:max_id+1}).select({ uid: 1,name:1, email:1 });
      // console.log(newUserInfo);
      // res.render(

      //   'views/login',
      //   {
      //     // usrId: max_id + 1,

      //   })
    }
  });
}
else{

    // popup.alert("Email already exists");

    // alert('Email already exists!');
//   popup.alert({
//     content: 'Email already exists!'
// });
  //  alert("Email already exists");
  // console.log("User already exists");
}
}

);

const brthUpload = upload.fields([{
  name: 'bUserImg',
  maxCount: 1
}, {
  name: 'bUserImg2',
  maxCount: 1
}]);
app.post("/selfChoice/birthChoice/birthInfo/:usrId", brthUpload, function (req, res) {
  if(logged == true){
  var usrId = parseInt(req.params.usrId);

  var cimgf = req.files.bUserImg[0].path;
  var cimgb = req.files.bUserImg2[0].path;
  const newBirth = new birth_info({

    uid: usrId,
    userImgF: path.join(".." + '/' + cimgf),
    userImgB: path.join(".." + '/' + cimgb),
    name: req.body.birthtext1,
    fathers_name: req.body.birthtext2,
    grand_fathers_name: req.body.birthtext3,
    mothers_full_name: req.body.birthtext4,
    place_or_country_of_birth: req.body.birthtext5,
    region_or_city_adminstration: req.body.birthtext6,
    zone_or_city_adminstration: req.body.birthtext7,
    gender: req.body.birthgender,
    citizenship_status: req.body.citizengender,
    date_of_birthday: req.body.birthdaycl1,
    date_of_birthday_registration: Date.now(),
    forHisChild: false,
    status: 'requested'

  }
  );


  newBirth.save(function (err) {
    if (err) {
      console.log(err);
    } else {

      // userDataFunc(usrId);
      // res.render(
      //   'views/userProfile', {

      //   }
      // );
      res.sendFile(__dirname + "/success.html");
    }
  });
}
});

var childStorage = multer.diskStorage({

  destination: (req, file, cb) => {
    if (file.fieldname === 'childUserImg') {
      cb(null, 'uploads/childpic/frontid');

    }
    if (file.fieldname === 'childUserImg2') {
      cb(null, 'uploads/childpic/backid');
    }

  },
  filename: (req, file, cb) => {
    if (file.fieldname === 'childUserImg') {
      cb(null, 'childfrontid_' + Date.now() + '_' + file.originalname);

    }
    if (file.fieldname === 'childUserImg2') {
      cb(null, 'childbackid-' + Date.now() + '-' + file.originalname);
    }

  }
});


const childUpload = multer({
  storage: childStorage,
  limits: {
    fileSize: 1024 * 1024 * 10
  },
  fileFilter: (req, file, cb) => {
    checkFileTypeChild(file, cb);
  }
});

function checkFileTypeChild(file, cb) {
  if (file.fieldname === "childUserImg" || file.fieldname === "childUserImg2") {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
}

const childUploadFunc = childUpload.fields([{
  name: 'childUserImg',
  maxCount: 1
}, {
  name: 'childUserImg2',
  maxCount: 1
}]);

app.post("/childChoice/childBirth/childBirthInfo/:usrId", childUploadFunc, async function (req, res) {
  var usrId = parseInt(req.params.usrId);
  var cimgf = req.files.childUserImg[0].path;
  var cimgb = req.files.childUserImg2[0].path;
  var max_id = 100;
  const uData = await User.find({}).sort({
    uid: -1
  }).limit(1).select({
    uid: 1
  });
  var uMaxId = 0;
  uData.forEach(element => {
    uMaxId = element.uid;
  });

  var cMaxId = 0;

  const cData = await Child.find({}).sort({
    uid: -1
  }).limit(1).select({
    uid: 1
  });
  cData.forEach(element => {
    cMaxId = element.uid;
  });

  if (cMaxId != null && uMaxId != null) {
    if (cMaxId > uMaxId) {
      max_id = cMaxId;
    }
    if (cMaxId < uMaxId) {
      max_id = uMaxId;
    }
  }

  const newBirth = new birth_info({
    uid: max_id + 1,
    userImgF: path.join(".." + '/' + cimgf),
    userImgB: path.join(".." + '/' + cimgb),
    name: req.body.birthtext1,
    fathers_name: req.body.birthtext2,
    grand_fathers_name: req.body.birthtext3,
    mothers_full_name: req.body.birthtext4,
    place_or_country_of_birth: req.body.birthtext5,
    region_or_city_adminstration: req.body.birthtext6,
    zone_or_city_adminstration: req.body.birthtext7,
    gender: req.body.birthtext8,
    citizenship_status: req.body.birthtext9,
    date_of_birthday: req.body.birthdaycl1,
    date_of_birthday_registration: Date.now(),
    forHisChild: true,
    status: 'requested'

  });

  const newChild = new Child({
    familyId: usrId,
    uid: max_id + 1,
    isStillAlive: true,

  });

  var childIdAssign = max_id + 1;
  var forChildrenAssig = {
    childId: childIdAssign
  };
  User.update({
      uid: usrId
    }, {
      $push: {
        forChildren: forChildrenAssig
      }
    },
    function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log(success);
      }
    }
  );

  newChild.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      // console.log("selected id is:", getId());

      res.sendFile(__dirname + "/success.html");
    }
  });

  newBirth.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      // console.log("selected id is:", getId());

      res.sendFile(__dirname + "/success.html");
    }
  });

});

// app.post("/selfChoice/birthChoice/birthInfo/:usrId", brthUpload, function (req, res) {
const mrgUploadFunc = mrgUpload.fields([{
  name: 'mrgUserImg',
  maxCount: 1
}, {
  name: 'mrgUserImg2',
  maxCount: 1
}]);
app.post("/selfChoice/marriageChoice/marriageInfo/:usrId", mrgUploadFunc, function (req, res) {
  var usrId = parseInt(req.params.usrId);

  var cimgf = req.files.mrgUserImg[0].path;
  var cimgb = req.files.mrgUserImg2[0].path;

  const newMarriage = new marriage_info({
    uid: usrId,
    wifes_name: req.body.marriagetext1,
    wifes_fathers_name: req.body.marriagetext2,
    wifes_grand_fathers_name: req.body.marriagetext3,
    husbands_name: req.body.marriagetext4,
    husbands_fathers_name: req.body.marriagetext5,
    husbands_grand_fathers_name: req.body.marriagetext6,
    place_of_marriage: req.body.marriagetext7,
    place_of_marriage_registration: req.body.marriagetext8,
    wifes_citizenship_status: req.body.marriagetext9,
    husbands_citizenship_status: req.body.marriagetext10,
    wifes_birthday: req.body.marriagecl1,
    husbands_birthday: req.body.marriagecl2,
    date_of_marriage: req.body.marriagecl3,
    date_of_marriage_registration: Date.now(),
    status: 'requested',
    mrgUserImgF: path.join(".." + '/' + cimgf),
    mrgUserImgB: path.join(".." + '/' + cimgb),

  });

  newMarriage.save(function (err) {
    if (err) {
      console.log(err);
    } else {

      res.sendFile(__dirname + "/success.html");
    }
  });


});

var dvcStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'dvcUserImg') {
      cb(null, 'uploads/dvcpic/frontid');

    }
    if (file.fieldname === 'dvcUserImg2') {
      cb(null, 'uploads/dvcpic/backid');
    }

  },
  filename: (req, file, cb) => {
    if (file.fieldname === 'dvcUserImg') {
      cb(null, 'dvcfrontid_' + Date.now() + '_' + file.originalname);

    }
    if (file.fieldname === 'dvcUserImg2') {
      cb(null, 'dvcbackid-' + Date.now() + '-' + file.originalname);
    }

  }
});

const dvcUpload = multer({
  storage: dvcStorage,
  limits: {
    fileSize: 1024 * 1024 * 10
  },
  fileFilter: (req, file, cb) => {
    checkFileTypeDvc(file, cb);
  }
});

function checkFileTypeDvc(file, cb) {
  if (file.fieldname === "dvcUserImg" || file.fieldname === "dvcUserImg2") {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
}

const dvcUploadFunc = dvcUpload.fields([{
  name: 'dvcUserImg',
  maxCount: 1
}, {
  name: 'dvcUserImg2',
  maxCount: 1
}]);
app.post("/selfChoice/divorceChoice/divorceInfo/:usrId", dvcUploadFunc, function (req, res) {
  var usrId = parseInt(req.params.usrId);

  var cimgf = req.files.dvcUserImg[0].path;
  var cimgb = req.files.dvcUserImg2[0].path;

  const newDivorce = new divorce_info({
    uid: usrId,
    ex_wifes_name: req.body.divorcetext1,
    ex_wifes_fathers_name: req.body.divorcetext2,
    ex_wifes_grand_fathers_name: req.body.divorcetext3,
    ex_husbands_name: req.body.divorcetext4,
    ex_husbands_fathers_name: req.body.divorcetext5,
    ex_husbands_grand_fathers_name: req.body.divorcetext6,
    place_of_divorce_dissolved: req.body.divorcetext7,
    place_of_divorce_registration: req.body.divorcetext8,
    ex_wifes_citizenship_status: req.body.divorcetext9,
    ex_husbands_citizenship_status: req.body.divorcetext10,
    ex_wifes_birthday: req.body.divorcecl1,
    ex_husbands_birthday: req.body.divorcecl2,
    date_of_divorce: req.body.divorcecl3,
    status: 'requested',
    dvcUserImgF: cimgf,
    dvcUserImgB: cimgb
  });

  newDivorce.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname + "/success.html");
    }
  });
});

app.post("/familyChoice/deathChoice/noChoice/deathInfo/:usrId", async function (req, res) {

  var usrId = req.params.usrId;
  var dthMaxId = usrId + "d1";
  var cMaxId = "0";
  const dthDataId = await death_infos.find({}).sort({
    uid: -1
  }).limit(1).select({
    uid: 1
  });
  console.log('=====>>>>>' + dthDataId);
  dthDataId.forEach(element => {
    cMaxId = element.uid;
  });

  if (cMaxId != "0") {
    cMaxId = cMaxId.slice(usrId.length + 1);
    var intMaxId = parseInt(cMaxId) + 1;
    var strId = intMaxId.toString();
    cMaxId = usrId + 'd' + strId;

    // if (parseInt(cMaxId) > dthMaxId) {
    dthMaxId = cMaxId;
    // }
    // if (cMaxId < dthMaxId){
    //   max_id = uMaxId;
    // }
  }


  console.log("Death text: ", req.body.deathtext1)
  const newDeath = new death_infos({
    uid: dthMaxId,
    anotherCertId: 0,
    deceased_name: req.body.deathtext1,
    fathers_name: req.body.deathtext2,
    grand_fathers_name: req.body.deathtext3,
    title_of_the_deceased: req.body.deathtext4,
    place_of_death: req.body.deathtext5,
    gender: req.body.deathtext6,
    citizenship_status: req.body.deathtext9,
    date_of_death: req.body.deathcl1,
    date_of_death_registration: Date.now(),
    status: 'requested'
  });

  var isCorrectInfoNo = false;
  newDeath.save(function (err) {
    if (err) {
      console.log(err);
    } else {

      isCorrectInfoNo = true;
      result(isCorrectInfoNo);
      res.sendFile(__dirname + "/success.html");
    }
  });

  function result(isCorrectInfoNO) {
    if (isCorrectInfoNO === true) {
      //  var prevData = User.find({uid:usrId})

      var forFamilyAssig = {
        familyId: dthMaxId
      };
      User.update({
          uid: usrId
        }, {
          $push: {
            forFamily: forFamilyAssig
          }
        },
        function (error, success) {
          if (error) {
            console.log(error);
          } else {
            console.log(success);
          }
        }
      );
    }
  }

  // console.log("THe Result=>>"+ isCorrectInfoYes);

});

app.post("/familyChoice/deathChoice/deathYesInfo/:usrId", async function (req, res) {
  if(logged === true){
  var usrId = req.params.usrId;
  var dthMaxId = usrId + "d1";
  var cMaxId = "0";
  const dthDataId = await death_infos.find({}).sort({
    uid: -1
  }).limit(1).select({
    uid: 1
  });
  dthDataId.forEach(element => {
    cMaxId = element.uid;
  });

  if (cMaxId != "0") {
    cMaxId = cMaxId.slice(usrId.length + 1);
    var intMaxId = parseInt(cMaxId) + 1;
    var strId = intMaxId.toString();
    cMaxId = usrId + 'd' + strId;

    // if (parseInt(cMaxId) > dthMaxId) {
    dthMaxId = cMaxId;
    // }
    // if (cMaxId < dthMaxId){
    //   max_id = uMaxId;
    // }
  }




  var othrId = parseInt(req.body.idDeathText);
  console.log("Death text: ", req.body.deathtext1)
  const newDeath = new death_infos({
    uid: dthMaxId,
    anotherCertId: othrId,
    deceased_name: req.body.deathtext1,
    fathers_name: req.body.deathtext2,
    grand_fathers_name: req.body.deathtext3,
    title_of_the_deceased: req.body.deathtext4,
    place_of_death: req.body.deathtext5,
    gender: req.body.deathtext6,
    citizenship_status: req.body.deathtext9,
    date_of_death: req.body.deathcl1,
    date_of_death_registration: Date.now(),
    status: 'requested'
  });
  var isCorrectInfo = false;
  newDeath.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      isCorrectInfo = true;
      result(isCorrectInfo);
      res.sendFile(__dirname + "/success.html");
    }
  });

  function result(isCorrectInfo) {
    if (isCorrectInfo === true) {
      var forFamilyAssig = {
        familyId: dthMaxId
      };
      User.update({
          uid: usrId
        }, {
          $push: {
            forFamily: forFamilyAssig
          }
        },
        function (error, success) {
          if (error) {
            console.log(error);
          } else {
            console.log(success);
          }
        }
      );

    }
  }

}
}
);

app.post("/login", async function (req, res) {

  const email = req.body.email;
  const password = md5(req.body.password);

  User.findOne({
    email: email
  }, async function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          if (foundUser.role == 'admin') {
            logged = true;
            console.log(logged);
            // res.render('views/administer');
            var totalPopulation = 0;
            var totalMale = 0;
            var totalFemale = 0;
            totalMale = await User.count({
              $and: [{
                gender: 'male'
              }, {
                hasTookBirthCert: true
              }]
            });
            totalFemale = await User.count({
              $and: [{
                gender: 'female'
              }, {
                hasTookBirthCert: true
              }]
            });
            totalPopulation = totalFemale + totalMale;

            console.log("The Total Population==>>>" + totalPopulation);
            console.log("The Total Male==>>>" + totalMale);
            console.log("The Total Female==>>>" + totalFemale);
            var thisYear = new Date().getFullYear();

            var lastYear = thisYear - 1;
            console.log("This year:>> " + thisYear);
            var selectedMonth = [];
            var i = 0;
            console.log(lastYear);
            var year = await User.find().sort({
              user_reg_date: 1
            }).select({
              _id: -1,
              user_reg_date: 1
            });
            year.forEach(element => {
              console.log(">>> " + element.user_reg_date.getMonth());
              if (element.user_reg_date.getFullYear() === lastYear) {
                selectedMonth[i] = element.user_reg_date.getMonth();
                i++;

              }
              // // console.log(element.user_reg_date.getFullYear());
            });
            console.log("monthly: " + i);
            for (var j = 0; j < selectedMonth.length; j++) {
              console.log("Selected:=>> " + selectedMonth[j]);
            }

            // var arr = ['a', 'b', 'c', 'd', 'd', 'e', 'a', 'b', 'c', 'f', 'g', 'h', 'h', 'h', 'e', 'a'];
            var eachMonthTotal = selectedMonth.reduce(function (prev, cur) {
              prev[cur] = (prev[cur] || 0) + 1;
              return prev;
            }, {});


            for (var ka = 0; ka < 12; ka++) {
              if (eachMonthTotal[ka] == null) {
                eachMonthTotal[ka] = 0;
              }
            }
            // map is an associative array mapping the elements to their frequency:
            console.log(eachMonthTotal);
            // console.log(eachMonthTotal[0]);


            res.render(
              'views/birth12', {
                eachMonthTotal: eachMonthTotal,
                totalPopulation: totalPopulation,
                totalMale: totalMale,
                totalFemale: totalFemale
              }
            );
          }

          if (foundUser.role == 'users') {
            var usrId = 0;
            var mrgid = 0;
            var dvcid = 0;
            var birthid = 0;
            var forChildId = 0;
            var brthstatus = "";
            var mrgstatus = "";
            var dvcstatus = "";

            const userData = await User.find({
              email: email
            }).select({
              uid: 1,
              name: 1,
              email: 1
            });
            userData.forEach(element => {
              usrId = element.uid;
            });
            const bdata = await birth_info.find({
              uid: usrId
            }).select({
              uid: 1,
              status: 1,
              date_of_birthday_registration: 1,
            });
            bdata.forEach(element => {
              birthid = element.uid;
              brthstatus = element.status;
              if (brthstatus === 'requested') {
                brthstatus = "was on Pending";
              }
              if (brthstatus === 'approved') {
                brthstatus = "has been Approved";
              }
            });
            const dvcData = await divorce_info.find({
              uid: usrId
            }).select({
              uid: 1,
              status: 1,
              date_of_birthday_registration: 1,
            });
            dvcData.forEach(element => {
              dvcid = element.uid;
              dvcstatus = element.status;
              if (dvcstatus === 'requested') {
                dvcstatus = "was on Pending";
              }
              if (dvcstatus === 'approved') {
                dvcstatus = "has been Approved";
              }
            });
            const mrgData = await marriage_info.find({
              uid: usrId
            }).select({
              uid: 1,
              status: 1,
              date_of_marriage_registration: 1,
            });
            mrgData.forEach(element => {
              mrgid = element.uid;
              mrgstatus = element.status;
              if (mrgstatus === 'requested') {
                mrgstatus = "was on Pending";
              }
              if (mrgstatus === 'approved') {
                mrgstatus = "has been Approved";
              }
            });
            var childIdColl = [];
            var i = 0;
            var childDataColl = [];
            const childData = await Child.find({
              familyId: usrId
            }).select({
              uid: 1
            });
            console.log("Here is child data: " + childData);
            childData.forEach(element => {
              childIdColl[i] = element.uid;
              i++;
              // forChildId = element.uid;
            });
            console.log("Here is:=> " + forChildId);
            var childStatusColl = [];

            for (var j = 0; j < childIdColl.length; j++) {
              console.log("Here is collection legth:=> " + childIdColl[j]);
              childDataColl[j] = await birth_info.find({
                uid: childIdColl[j]
              }).select({
                uid: 1,
                name: 1,
                status: 1,
                date_of_birthday_registration: 1,
              });
            }
            for (var k = 0; k < childDataColl.length; k++) {

              childDataColl[k].forEach(element => {
                childStatusColl[k] = element.status;
                console.log("status: " + element.status);

              });

              console.log("status++===: " + childStatusColl[k]);

              if (childStatusColl[k] === 'requested') {
                childStatusColl[k] = 'was on Pending';
              }
              if (childStatusColl[k] === 'approved') {
                childStatusColl[k] = "has been Approved";
              }
              console.log("Data=>>: " + childDataColl[k]);
            }

            console.log(birthid);
            logged = true;
            console.log(bdata);
            var famId = await User.find({
              uid: usrId
            }).select({
              forFamily: 1
            });

            console.log("For Family ===>>>" + famId);

            const deathData = await death_infos.find({
              uid: usrId
            }).sort({
              date_of_death_registration: 1
            }).select({
              deceased_name: 1,
              fathers_name: 1,
              uid: 1,
              status: 1,
              date_of_death_registration: 1
            });
            var deathIndex = 0;
            var dthIdColl = [];
            var dthStatusColl = [];
            deathData.forEach(element => {
              dthIdColl[deathIndex] = element.uid;
              dthStatusColl[deathIndex] = element.status;
              if (dthStatusColl[deathIndex] === 'requested') {
                dthStatusColl[deathIndex] = 'was on Pending';
              }
              if (dthStatusColl[deathIndex] === 'approved') {
                dthStatusColl[deathIndex] = 'has been Approved';
              }
              deathIndex++;
            });

            for (var l = 0; l < dthIdColl.length; l++) {
              console.log("DeathId==>> " + dthIdColl[l]);
            }


            //  console.log(deathData);

            res.render(
              'views/userProfile', {
                birthid: birthid,
                brthstatus: brthstatus,
                mrgstatus: mrgstatus,
                dvcstatus: dvcstatus,
                childStatusColl: childStatusColl,
                dthStatusColl: dthStatusColl,
                mrgid: mrgid,
                dvcid: dvcid,
                bdata: bdata,
                childIdColl: childIdColl,
                dthIdColl: dthIdColl,
                mrgData: mrgData,
                dvcData: dvcData,
                userData: userData,
                childDataColl: childDataColl,
                deathData: deathData,
              });
          }
        }
      } else {
        res.sendFile(__dirname + "/login.html");
      }
    }
  });
});

app.get("/login/birth", function (req, res) {
  if (logged == true) {
    console.log('Logged Booleans ', logged);
    res.render('views/birth')
  }
});

app.get("/login/request/:pid", async function (req, res) {
  var pid = parseInt(req.params.pid);

  console.log(logged);
  if (logged == true) {

    res.render(
      'views/components/option', {

        usrId: pid,
      })
  }
});

app.get("/login/request", function (req, res) {
  if (logged == true) {
    async function getResult() {
      const bdata = await birth_info.find().sort({
        uid: -1
      }).select({
        uid: 1,
        name: 1,
        date_of_birthday_registration: 1,
        userImgF: 1,
        userImgB: 1
      });
      const dth_data = await death_infos.find().sort({
        date_of_birthday_registration: 1
      }).select({
        uid: 1,
        name: 1,
        date_of_birthday_registration: 1
      });

      const mrg_data = await marriage_info.find().sort({
        date_of_marriage_registration: 1
      }).select({
        uid: 1,
        wifes_name: 1,
        husbands_name: 1,
        date_of_marriage_registration: 1
      });
      const dvc_data = await divorce_info.find().sort({
        date_of_divorce_registration: 1
      }).select({

      });
      console.log(dvc_data);
      res.render(
        'views/request', {
          bdata: bdata,
          dth_data: dth_data,
          mrg_data: mrg_data,
          dvc_data: dvc_data,
        })

    }
    getResult();
  }
});

app.get("/login/request/reqdetail/breq/:pid",
  function (req, res) {
    var pid = parseInt(req.params.pid);

    console.log("Here is passed birth id:", pid);

    if (logged == true) {
      async function getResult() {
        const bdata = await birth_info.find({
          uid: pid
        }).sort({
          date_of_birthday_registration: 1
        }).select({});
        console.log(bdata);
        res.render(
          'views/userData', {
            bdata: bdata,
          });

      }
      getResult();

    }
  });


app.get("/login/request/reqdetail/dthreq/:pid", function (req, res) {
  var pid = req.params.pid;
  console.log("Here is passed birth id:", pid);

  // if (logged == true) {
  async function getResult() {
    const dthdata = await death_infos.find({
      uid: pid
    }).sort({
      date_of_death_registration: 1
    }).select({});
    console.log(dthdata);
    res.render(
      'views/userDataDeath', {
        dthdata: dthdata,
      });

  }
  getResult();

  // }
});

// /login/request/reqdetail/breq/approve/107

app.get("/login/request/reqdetail/breq/approve/:pid",
  function (req, res) {

    var pid = parseInt(req.params.pid);
    console.log("Here is approval request");

    //if (logged == true) {
    if ('/login/request/reqdetail/breq/approve/:pid') {
      async function getResult() {
        const brthApprove = await birth_info.updateOne({
          uid: pid
        }, {
          $set: {
            status: 'approved'
          }
        });

        const bdata = await birth_info.find({
          uid: pid
        }).sort({
          date_of_birthday_registration: 1
        }).select({});
        console.log(bdata);
        res.render(
          'views/userDataChecked', {
            bdata: bdata,
          });

      }
      getResult();
    }
    // }
  }
);


app.get("/login/request/reqdetail/breq/decline/:pid",
  function (req, res) {

    var pid = parseInt(req.params.pid);
    console.log("Here is approval request");

    if (logged == true) {
      async function getResult() {
        const brthApprove = await birth_info.updateOne({
          uid: pid
        }, {
          $set: {
            status: 'declined'
          }
        });

        const bdata = await birth_info.find({
          uid: pid
        }).sort({
          date_of_birthday_registration: 1
        }).select({});
        console.log(bdata);
        res.render(
          'views/userDataChecked', {
            bdata: bdata,
          });

      }
      getResult();

    }
  }
);
// /login/request/print/

app.get("/login/request/reqdetail/breq/print/:pid",
  function (req, res) {
    var pid = parseInt(req.params.pid);

    console.log("Here is passed birth id: ", pid);

    //if (logged == true) {
      getResult();

    async function getResult() {
      // var pid = parseInt(req.params.pid);
      try{
      console.log("Inside value>>> ", pid)
      const bdata = await birth_info.find({
        uid: pid
      }).sort({
      }).select({});
      console.log(bdata);
      bdata.forEach(element=>{
      console.log("Name:"+ element.name);
      });
       res.render(
        'views/print_form_birth', {
          bdata: bdata,
        }
        
      );
    
  }catch(error){
    console.log(error);
  }
}

  }
  //}

);





app.get("/login/request/reqdetail/dthreq/approve/:pid",
  function (req, res) {

    var pid = req.params.pid;
    console.log("Here is approval request");

    //if (logged == true) {
    async function getResult() {
      const dthApprove = await death_infos.updateOne({
        uid: pid
      }, {
        $set: {
          status: 'approved'
        }
      });

      const dthdata = await death_infos.find({
        uid: pid
      }).sort({
        date_of_death_registration: 1
      }).select({});
      console.log(dthdata);
      res.render(
        'views/userDataCheckedDeath', {
          dthdata: dthdata,
        });


    }
    getResult();
    // }
  }
);


app.get("/login/request/reqdetail/dthreq/decline/:pid",
  function (req, res) {

    var pid = req.params.pid;
    console.log("Here is approval request");

    //if (logged == true) {
    async function getResult() {
      const dthApprove = await death_infos.updateOne({
        uid: pid
      }, {
        $set: {
          status: 'declined'
        }
      });

      const dthdata = await death_infos.find({
        uid: pid
      }).sort({
        date_of_death_registration: 1
      }).select({});
      console.log(dthdata);
      res.render(
        'views/userDataCheckedDeath', {
          dthdata: dthdata,
        });


    }
    getResult();
    // }
  }
);

app.get("/login/request/reqdetail/dthreq/print/:pid", function (req, res) {
  var pid = req.params.pid;
  console.log("Here is passed death id:1", pid);

  //if (logged == true) {
    console.log("Here is passed death id:", pid);

    async function getResult() {
      const dthdata = await death_infos.find({
        uid: pid
      }).sort({
      }).select({
        
      });

      console.log(dthdata);
      res.render(
        'views/print_form_death',
         {
          dthdata: dthdata,
        }
        );

        return;
    }
    getResult();
//}
});


// /login/request/reqdetail/dthreq/approve/<%=pid%>


app.get("/login/request/reqdetail/dthreq/:pid", function (req, res) {
  var pid = parseInt(req.params.pid);

  if (logged == true) {
    console.log("Here is passed death id:", pid);

    async function getResult() {
      const dthdata = await death_infos.find({
        uid: pid
      }).sort({
        date_of_birthday_registration: 1
      }).select({
        uid: 1,
        name: 1,
        date_of_birthday_registration: 1
      });
      console.log(dthdata);

    }
    getResult();
  }
});

app.get("/login/request/reqdetail/mrgreq/:pid", function (req, res) {
  var pid = parseInt(req.params.pid);
  console.log("Here is passed marriage id:", pid);

  if (logged == true) {

    async function getResult() {
      const mrg_data = await marriage_info.find({
        uid: pid
      }).sort({
        date_of_marriage_registration: 1
      }).select({

      });
      console.log(mrg_data);

      res.render(
        'views/userDataMrg', {
          mrg_data: mrg_data,
        });


    }
    getResult();
  }
});

///login/request/reqdetail/mrgreq/approve/<%=pid%>


app.get("/login/request/reqdetail/mrgreq/approve/:pid",
  function (req, res) {

    var pid = req.params.pid;
    console.log("Here is approval request");

    //if (logged == true) {
    async function getResult() {
      const mrgApprove = await marriage_info.updateOne({
        uid: pid
      }, {
        $set: {
          status: 'approved'
        }
      });

      const mrg_data = await marriage_info.find({
        uid: pid
      }).sort({
        date_of_marriage_registration: 1
      }).select({});
      console.log(mrg_data);

      res.render(
        'views/userDataMrgChecked', {
          mrg_data: mrg_data,
        });


    }
    getResult();
    // }
  }
);


app.get("/login/request/reqdetail/mrgreq/decline/:pid",
  function (req, res) {

    var pid = req.params.pid;
    console.log("Here is approval request");

    //if (logged == true) {
    async function getResult() {
      const mrgApprove = await marriage_info.updateOne({
        uid: pid
      }, {
        $set: {
          status: 'declined'
        }
      });

      const mrg_data = await marriage_info.find({
        uid: pid
      }).sort({
        date_of_marriage_registration: 1
      }).select({});
      console.log(mrg_data);

      res.render(
        'views/userDataMrgChecked', {
          mrg_data: mrg_data,
        });


    }
    getResult();
    // }
  }
);

// http://127.0.0.1:3000/login/request/reqdetail/dvcreq/118

app.get("/login/request/reqdetail/dvcreq/:pid", function (req, res) {
  var pid = parseInt(req.params.pid);
  console.log("Here is passed divorce id:", pid);

  if (logged == true) {

    async function getResult() {
      const dvc_data = await divorce_info.find({
        uid: pid
      }).sort({
        date_of_marriage_registration: 1
      }).
      select({});

      console.log(dvc_data);
      res.render(
        'views/userDataDvc', {
          dvc_data: dvc_data,
        });

    }
    getResult();


  }
});

app.get("/login/request/reqdetail/dvcreq/approve/:pid",
  function (req, res) {

    var pid = req.params.pid;
    console.log("Here is approval request");

    //if (logged == true) {
    async function getResult() {
      const dvcApprove = await divorce_info.updateOne({
        uid: pid
      }, {
        $set: {
          status: 'approved'
        }
      });

      const dvc_data = await divorce_info.find({
        uid: pid
      }).sort({
        date_of_divorce_registration: 1
      }).select({});
      console.log(dvc_data);

      res.render(
        'views/userDataDvcChecked', {
          dvc_data: dvc_data,
        });


    }
    getResult();
    // }
  }
);


app.get("/login/request/reqdetail/dvcreq/decline/:pid",
  function (req, res) {

    var pid = req.params.pid;
    console.log("Here is approval request");

    //if (logged == true) {
    async function getResult() {
      const dvcApprove = await divorce_info.updateOne({
        uid: pid
      }, {
        $set: {
          status: 'declined'
        }
      });

      const dvc_data = await divorce_info.find({
        uid: pid
      }).sort({
        date_of_divorce_registration: 1
      }).select({});
      console.log(dvc_data);

      res.render(
        'views/userDataDvcChecked', {
          dvc_data: dvc_data,
        });


    }
    getResult();
    // }
  }
);


app.post("/login_admin", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  admin.findOne({
    email: email
  }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          return res.render("admin.ejs");
        }
      }
    }
  });
});

app.get("/selfChoice/:usrId", function (req, res) {
  var usrId = parseInt(req.params.usrId);

  res.render(
    'views/selfChoice', {
      usrId: usrId,
    });

});

app.get("/childChoice/:usrId", function (req, res) {
  var usrId = parseInt(req.params.usrId);

  res.render(
    'views/childChoice', {
      usrId: usrId,
    });

});


app.get("/childChoice/childBirth/:usrId", function (req, res) {
  var usrId = parseInt(req.params.usrId);

  res.render(
    'views/childBirth', {
      usrId: usrId,
    });

});


app.get("/familyChoice/:usrId", function (req, res) {
  if (logged === true) {
    var usrId = parseInt(req.params.usrId);

    res.render(
      'views/familyChoice', {
        usrId: usrId,
      });

  }
});

app.get("/familyChoice/deathChoice/:usrId", function (req, res) {
  var usrId = parseInt(req.params.usrId);

  res.render(
    'views/otherCert', {
      usrId: usrId,
    });
});

app.get("/familyChoice/deathChoice/yesChoice/:usrId", function (req, res) {
  var usrId = parseInt(req.params.usrId);
  console.log(usrId);
  res.render(
    'views/deathInfoYes', {
      usrId: usrId,
    });
});


app.get("/familyChoice/deathChoice/noChoice/:usrId", function (req, res) {
  var usrId = parseInt(req.params.usrId);
  console.log(usrId);
  res.render(
    'views/deathInfo', {
      usrId: usrId,
    });
});

// app.get("/familyChoice/deathChoice/:usrId", function (req, res) {
//   var usrId = parseInt(req.params.usrId);

//   res.render(
//     'views/deathInfo',
//     {
//       usrId: usrId,
//     });
// }
// );



app.get("/selfChoice/birthChoice/:usrId", function (req, res) {
  if(logged === true){
  var usrId = parseInt(req.params.usrId);

  res.render(
    "views/birth", {
      usrId: usrId,
    }
  );
}
});

app.get("/selfChoice/marriageChoice/:usrId", function (req, res) {
  if(logged === true){
  var usrId = parseInt(req.params.usrId);

  res.render(
    "views/marriage", {
      usrId: usrId,
    }
  );
  }
});

app.get("/selfChoice/divorceChoice/:usrId", function (req, res) {
  if(logged === true){
  var usrId = parseInt(req.params.usrId);

  res.render(
    "views/divorce", {
      usrId: usrId,
    }
  );
  }
});


app.get("/generateReport", (req, res) => {

  async function convertEJS() {
    const browser = await puppeteer.launch({
      // headless: false,
      // args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/');
    await page.pdf({
      path: 'output2.pdf',
      format: 'A4',
      printBackground: true
    });
    await browser.close();
  }

  convertEJS();

});


async function userDataFunc(req, res) {
  var usrId = 0;
  var mrgid = 0;
  var dvcid = 0;
  var birthid = 0;
  var forChildId = 0;
  var brthstatus = "";
  var mrgstatus = "";
  var dvcstatus = "";

  const userData = await User.find({
    uid: uid
  }).select({
    uid: 1,
    name: 1,
    email: 1
  });
  userData.forEach(element => {
    usrId = element.uid;
  });
  const bdata = await birth_info.find({
    uid: usrId
  }).select({
    uid: 1,
    status: 1,
    date_of_birthday_registration: 1,
  });
  bdata.forEach(element => {
    birthid = element.uid;
    brthstatus = element.status;
    if (brthstatus === 'requested') {
      brthstatus = "was on Pending";
    }
    if (brthstatus === 'approved') {
      brthstatus = "has been Approved";
    }
  });
  const dvcData = await divorce_info.find({
    uid: usrId
  }).select({
    uid: 1,
    status: 1,
    date_of_birthday_registration: 1,
  });
  dvcData.forEach(element => {
    dvcid = element.uid;
    dvcstatus = element.status;
    if (dvcstatus === 'requested') {
      dvcstatus = "was on Pending";
    }
    if (dvcstatus === 'approved') {
      dvcstatus = "has been Approved";
    }
  });
  const mrgData = await marriage_info.find({
    uid: usrId
  }).select({
    uid: 1,
    status: 1,
    date_of_marriage_registration: 1,
  });
  mrgData.forEach(element => {
    mrgid = element.uid;
    mrgstatus = element.status;
    if (mrgstatus === 'requested') {
      mrgstatus = "was on Pending";
    }
    if (mrgstatus === 'approved') {
      mrgstatus = "has been Approved";
    }
  });
  var childIdColl = [];
  var i = 0;
  var childDataColl = [];
  const childData = await Child.find({
    familyId: usrId
  }).select({
    uid: 1
  });
  console.log("Here is child data: " + childData);
  childData.forEach(element => {
    childIdColl[i] = element.uid;
    i++;
    // forChildId = element.uid;
  });
  console.log("Here is:=> " + forChildId);
  var childStatusColl = [];

  for (var j = 0; j < childIdColl.length; j++) {
    console.log("Here is collection legth:=> " + childIdColl[j]);
    childDataColl[j] = await birth_info.find({
      uid: childIdColl[j]
    }).select({
      uid: 1,
      name: 1,
      status: 1,
      date_of_birthday_registration: 1,
    });
  }
  for (var k = 0; k < childDataColl.length; k++) {

    childDataColl[k].forEach(element => {
      childStatusColl[k] = element.status;
      console.log("status: " + element.status);

    });

    console.log("status++===: " + childStatusColl[k]);

    if (childStatusColl[k] === 'requested') {
      childStatusColl[k] = 'was on Pending';
    }
    if (childStatusColl[k] === 'approved') {
      childStatusColl[k] = "has been Approved";
    }
    console.log("Data=>>: " + childDataColl[k]);
  }

  console.log(birthid);
  logged = true;
  console.log(bdata);
  var famId = await User.find({
    uid: usrId
  }).select({
    forFamily: 1
  });

  console.log("For Family ===>>>" + famId);

  const deathData = await death_infos.find({
    uid: usrId
  }).sort({
    date_of_death_registration: 1
  }).select({
    deceased_name: 1,
    fathers_name: 1,
    uid: 1,
    status: 1,
    date_of_death_registration: 1
  });
  var deathIndex = 0;
  var dthIdColl = [];
  var dthStatusColl = [];
  deathData.forEach(element => {
    dthIdColl[deathIndex] = element.uid;
    dthStatusColl[deathIndex] = element.status;
    if (dthStatusColl[deathIndex] === 'requested') {
      dthStatusColl[deathIndex] = 'was on Pending';
    }
    if (dthStatusColl[deathIndex] === 'approved') {
      dthStatusColl[deathIndex] = 'has been Approved';
    }
    deathIndex++;
  });

  for (var l = 0; l < dthIdColl.length; l++) {
    console.log("DeathId==>> " + dthIdColl[l]);
  }


  //  console.log(deathData);

  res.render(
    'views/userProfile', {
      birthid: birthid,
      brthstatus: brthstatus,
      mrgstatus: mrgstatus,
      dvcstatus: dvcstatus,
      childStatusColl: childStatusColl,
      dthStatusColl: dthStatusColl,
      mrgid: mrgid,
      dvcid: dvcid,
      bdata: bdata,
      childIdColl: childIdColl,
      dthIdColl: dthIdColl,
      mrgData: mrgData,
      dvcData: dvcData,
      userData: userData,
      childDataColl: childDataColl,
      deathData: deathData,
    });
}

app.post("/choice2", function (req, res) {
  return res.render("marriage.ejs");
});
app.post("/choice3", function (req, res) {
  return res.render("divorce.ejs");
});
app.post("/choice4", function (req, res) {
  return res.render("death.ejs");
});

app.listen(PORT, function () {
  console.log("server running on port number 3000");
});