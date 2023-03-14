require("dotenv").config();
const { Buffer } = require("node:buffer");
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
var fs = require("fs-extra");

// const connection = require('./databases');
const dotenv = require("dotenv");
const morgan = require("morgan");
const md5 = require("md5");
const autoIncrement = require("mongoose-auto-increment");
const { pid } = require("process");
// const loginRouter = require('./routes/loginRoutes');

const app = express();

dotenv.config({ path: "config.env" });
const PORT = process.env.PORT || 8080;
app.use(morgan("tiny"));

app.use(express.static(__dirname));
app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/css", express.static(path.resolve(__dirname, "assets/js")));
app.use("/css", express.static(path.resolve(__dirname, "images")));
app.use(express.static(path.resolve(__dirname, "uploads/")));

// app.use(connection);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// app.use(path);

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname));
// app.set('views/components', path.resolve(__dirname))
// app.use('/login',loginRouter);

var connection = mongoose.connect("mongodb://127.0.0.1:27017/kebelleDb", {
  useNewUrlParser: true,
});
autoIncrement.initialize(mongoose.connection);

const userSchema = new mongoose.Schema({
  uid: Number,
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: "users",
  },
});
userSchema.plugin(autoIncrement.plugin, {
  model: "User",
  field: "uid",
  startAt: 100,
  incrementedBy: 1,
});

const birthSchema = new mongoose.Schema({
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
  userImg: String,
  // userImg: {
  //   data: String,
  //   // contentType: String
  // },
  // userImg: {
  //   data: Buffer,
  //   contentType: String
  // },
});

birthSchema.plugin(autoIncrement.plugin, {
  model: "birth_info",
  field: "rid",
  startAt: 100,
  incrementedBy: 1,
});

const marriageSchema = new mongoose.Schema({
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
  status: String,
});
marriageSchema.plugin(autoIncrement.plugin, {
  model: "marriage_info",
  field: "rid",
  startAt: 100,
  incrementedBy: 1,
});

const divorceSchema = new mongoose.Schema({
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
});
divorceSchema.plugin(autoIncrement.plugin, {
  model: "divorce_info",
  field: "rid",
  startAt: 100,
  incrementedBy: 1,
});

const deathSchema = new mongoose.Schema({
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
deathSchema.plugin(autoIncrement.plugin, {
  model: "death_info",
  field: "rid",
  startAt: 100,
  incrementedBy: 1,
});
// Step 5 - set up multer for storing uploaded files

var multer = require("multer");
const { encode } = require("node:punycode");
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    // cb(null, file.fieldname + '-' + Date.now()+orgN);
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var upload = multer({ storage: storage });

const User = new mongoose.model("User", userSchema);
const admin = new mongoose.model("admin", userSchema);
const birth_info = new mongoose.model("birth_info", birthSchema);
const marriage_info = new mongoose.model("marriage_info", marriageSchema);
const divorce_info = new mongoose.model("divorce_info", divorceSchema);
const death_info = new mongoose.model("death_info", deathSchema);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/sign_up.html");
});

app.post("/sign_up", function (req, res) {
  // Number nextUid = 0;
  const newUser = new User({
    // uid : 4,
    name: req.body.username,
    email: req.body.email,
    password: md5(req.body.password),
  });

  newUser.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname + "/choice.html");
    }
  });
  // const nextUid = User.find({}).sort({uid:-1}).limit(1);
  // const nextUid = User.find({}).sort({uid:-1}).limit(1);
  // console.log("UserID "+ nextUid) ;// for MAX
});

app.post("/birth", upload.single("bUserImg"), function (req, res) {
  // var orgName = req.file.originalname;
  // var pointIndex = orgName.indexOf('.');
  // var extName = orgName.slice(pointIndex);
  // console.log("Original Name Extension:", extName);
  var img = fs.readFileSync(req.file.path, { encoding: "utf8" });
  var cimg = req.file.path;
  console.log(cimg);
  //  console.log(img);
  //  let cimg = req.file.path;
  //  cimg = Buffer.allocUnsafe(cimg.length);
  // for(let i =0; i<cimg.length; i++){
  //   cimg[i]=cimg.charCodeAt(i);
  // }
  // console.log("Name is: ",cimg.toString('utf8'));
  var encode_img = img.toString("base64");
  // console.log("encode img: ",encode_img);
  var final_img = {
    contentType: req.file.mimetype,
    image: Buffer.from(encode_img, "base64"),
  };
  const newBirth = new birth_info({
    // userImg:final_img,

    // userImg :{
    //   // data : fs.readFileSync(path.join(__dirname + '/uploads/' + req.file)),
    //   // data : fs.readFileSync(path.join(__dirname + '/uploads/' + 'bUserImg-1674289625145'),
    //   // data : fs.readFileSync(path.join(__dirname + '/'+cimg),
    //   // data : path.join(__dirname + '/'+ cimg + extName),
    //   data : path.join(__dirname + '/'+ cimg+ extName),

    //   // {encoding:'base64', flag:'r'}
    //   // ),

    //   // contentType: 'image/*'
    // },
    userImg: path.join(".." + "/" + cimg),

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
    status: "requested",
  });

  //   birth_info.create(final_img,function(err){
  //     if (err) {
  //       console.log(err);
  //     }
  //     else{
  //         // console.log(result.img.Buffer);
  //         console.log("Saved To database");
  //         res.contentType(final_img.contentType);
  //         // res.send(final_img.image);
  //     }

  // });

  newBirth.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.contentType(final_img.contentType);

      res.sendFile(__dirname + "/success.html");
    }
  });
});

app.post("/marriage", function (req, res) {
  const newMarriage = new marriage_info({
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
    status: "requested",
  });

  newMarriage.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname + "/success.html");
    }
  });
});

app.post("/divorce", function (req, res) {
  const newDivorce = new divorce_info({
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
    status: "requested",
  });

  newDivorce.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname + "/success.html");
    }
  });
});

app.post("/death", function (req, res) {
  const newDeath = new death_info({
    deceased_name: req.body.deathtext1,
    fathers_name: req.body.deathtext2,
    grand_fathers_name: req.body.deathtext3,
    title_of_the_deceased: req.body.deathtext4,
    place_of_death: req.body.deathtext5,
    gender: req.body.deathtext6,
    citizenship_status: req.body.deathtext9,
    date_of_death: req.body.deathcl1,
    date_of_death_registration: Date.now(),
    status: "requested",
  });

  newDeath.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname + "/success.html");
    }
  });
});

var logged = false;
app.post("/login", function (req, res) {
  const email = req.body.email;
  const password = md5(req.body.password);

  User.findOne({ email: email }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          if (foundUser.role == "admin") {
            logged = true;
            // res.sendFile(__dirname + "/administer");
            console.log(logged);
            res.render("views/administer");
          }

          res.sendFile(__dirname + "/choice.html");
        }
      } else {
        res.sendFile(__dirname + "/login.html");
      }
    }
  });
});
app.get("/login/birth", function (req, res) {
  if (logged == true) {
    console.log("Logged Booleans ", logged);
    res.render("views/birth");
    // res.sendFile(__dirname + "/views/birth.html");
  }
});

app.get("/login/request", function (req, res) {
  if (logged == true) {
    // var bdata = birth_info.find().sort({date_of_birthday_registration:1}).select({name:1, date_of_birthday_registration:1});

    async function getResult() {
      const bdata = await birth_info
        .find()
        .sort({ date_of_birthday_registration: 1 })
        .select({
          rid: 1,
          name: 1,
          date_of_birthday_registration: 1,
          userImg: 1,
        });
      var buf = [];

      //    bdata.forEach(elts =>{
      // //   console.log(elts.userImg);
      //    buf = Buffer.from(elts.userImg);
      //    elts.userImg = buf.toString();

      // });

      const dth_data = await death_info
        .find()
        .sort({ date_of_birthday_registration: 1 })
        .select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      const mrg_data = await marriage_info
        .find()
        .sort({ date_of_birthday_registration: 1 })
        .select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      const dvc_data = await divorce_info
        .find()
        .sort({ date_of_death_registration: 1 })
        .select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      res.render("views/request", {
        bdata: bdata,
        dth_data: dth_data,
        mrg_data: mrg_data,
        dvc_data: dvc_data,
      });
    }
    getResult();
  }
});

app.get("/login/request/reqdetail/breq/:pid", function (req, res) {
  var pid = parseInt(req.params.pid);
  console.log("Here is passed birth id:", pid);

  if (logged == true) {
    async function getResult() {
      const bdata = await birth_info
        .find({ rid: pid })
        .sort({ date_of_birthday_registration: 1 })
        .select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      console.log(bdata);
    }
    getResult();
  }
});

app.get("/login/request/reqdetail/dthreq/:pid", function (req, res) {
  var pid = parseInt(req.params.pid);
  console.log("Here is passed death id:", pid);

  if (logged == true) {
    // var bdata = birth_info.find().sort({date_of_birthday_registration:1}).select({name:1, date_of_birthday_registration:1});

    async function getResult() {
      const bdata = await death_info
        .find({ rid: pid })
        .sort({ date_of_birthday_registration: 1 })
        .select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      console.log(bdata);
      // res.render('views/request', {dthdata:dthdata})
    }
    getResult();
  }
});

app.get("/login/request/reqdetail/mrgreq/:pid", function (req, res) {
  var pid = parseInt(req.params.pid);
  console.log("Here is passed marriage id:", pid);

  if (logged == true) {
    // var bdata = birth_info.find().sort({date_of_birthday_registration:1}).select({name:1, date_of_birthday_registration:1});

    async function getResult() {
      const bdata = await marriage_info
        .find({ rid: pid })
        .sort({ date_of_birthday_registration: 1 })
        .select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      console.log(bdata);
      //res.render('views/request', {mrgdata:mrgdata})
    }
    getResult();
  }
});

app.get("/login/request/reqdetail/dvcreq/:pid", function (req, res) {
  var pid = parseInt(req.params.pid);
  console.log("Here is passed divorce id:", pid);

  if (logged == true) {
    // var bdata = birth_info.find().sort({date_of_birthday_registration:1}).select({name:1, date_of_birthday_registration:1});

    async function getResult() {
      const bdata = await divorce_info
        .find({ rid: pid })
        .sort({ date_of_birthday_registration: 1 })
        .select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      console.log(bdata);
      // res.render('views/request', {dvcdata:dvcdata})
    }
    getResult();
  }
});

app.post("/login_admin", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  admin.findOne({ email: email }, function (err, foundUser) {
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

app.post("/choice1", function (req, res) {
  return res.render("birth.ejs");
});
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

/*


require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const connection = require('./databases');
const dotenv = require("dotenv");
const morgan = require("morgan");
const md5 = require("md5");
const autoIncrement = require('mongoose-auto-increment');
const { pid } = require("process");
const loginRouter = require('./routes/loginRoutes');

const app = express();

dotenv.config({ path: "config.env" });
const PORT = process.env.PORT || 8080;
app.use(morgan("tiny"));

app.use(express.static(__dirname));
app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/css", express.static(path.resolve(__dirname, "assets/js")));
app.use("/css", express.static(path.resolve(__dirname, "images")));

// app.use(connection);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname));
// app.set('views/components', path.resolve(__dirname))
app.use('/login',loginRouter);

// var connection = mongoose.connect("mongodb://127.0.0.1:27017/kebelleDb", { useNewUrlParser: true });
autoIncrement.initialize(mongoose.connection);


const birthSchema = new mongoose.Schema({
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
});

birthSchema.plugin(autoIncrement.plugin,
  {
    model: 'birth_info', field: 'rid',
    startAt: 100, incrementedBy: 1
  })

const marriageSchema = new mongoose.Schema({
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
  status: String,

});
marriageSchema.plugin(autoIncrement.plugin,
  {
    model: 'marriage_info', field: 'rid',
    startAt: 100, incrementedBy: 1
  })

const divorceSchema = new mongoose.Schema({
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

});
divorceSchema.plugin(autoIncrement.plugin,
  {
    model: 'divorce_info', field: 'rid',
    startAt: 100, incrementedBy: 1
  })

const deathSchema = new mongoose.Schema({
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
deathSchema.plugin(autoIncrement.plugin,
  {
    model: 'death_info', field: 'rid',
    startAt: 100, incrementedBy: 1
  })

// const User = new mongoose.model("User", userSchema);
// const admin = new mongoose.model("admin", userSchema);
const birth_info = new mongoose.model("birth_info", birthSchema);
const marriage_info = new mongoose.model("marriage_info", marriageSchema);
const divorce_info = new mongoose.model("divorce_info", divorceSchema);
const death_info = new mongoose.model("death_info", deathSchema);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/sign_up.html");
});

app.post("/sign_up", function (req, res) {

  // Number nextUid = 0;
  const newUser = new User({

    // uid : 4,
    name: req.body.username,
    email: req.body.email,
    password: md5(req.body.password),
  });


  newUser.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname + "/choice.html");
    }
  });
  // const nextUid = User.find({}).sort({uid:-1}).limit(1);
  // const nextUid = User.find({}).sort({uid:-1}).limit(1);
  // console.log("UserID "+ nextUid) ;// for MAX

});

app.post("/birth", function (req, res) {
  const newBirth = new birth_info({
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
    status: 'requested'

  });

  newBirth.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname + "/success.html");
    }
  });
});

app.post("/marriage", function (req, res) {
  const newMarriage = new marriage_info({
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
    status: 'requested'

  });

  newMarriage.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname + "/success.html");
    }
  });
});

app.post("/divorce", function (req, res) {
  const newDivorce = new divorce_info({
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
    status: 'requested'

  });

  newDivorce.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname + "/success.html");
    }
  });
});

app.post("/death", function (req, res) {
  const newDeath = new death_info({
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

  newDeath.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname + "/success.html");
    }
  });
});

// var logged = false;
// app.post("/login", function (req, res) {
//   const email = req.body.email;
//   const password = md5(req.body.password);

//   User.findOne({ email: email }, function (err, foundUser) {
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
// });
app.get("/login/birth", function (req, res) {
  if (logged == true) {
    console.log('Logged Booleans ', logged);
    res.render('views/birth')
    // res.sendFile(__dirname + "/views/birth.html");

  }
});

app.get("/login/request", function (req, res) {
  if (logged == true) {
    // var bdata = birth_info.find().sort({date_of_birthday_registration:1}).select({name:1, date_of_birthday_registration:1});

    async function getResult() {
      const bdata = await birth_info.find().sort({ date_of_birthday_registration: 1 }).select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      const dth_data = await death_info.find().sort({ date_of_birthday_registration: 1 }).select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      const mrg_data = await marriage_info.find().sort({ date_of_birthday_registration: 1 }).select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      const dvc_data = await divorce_info.find().sort({ date_of_death_registration: 1 }).select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      res.render(
        'views/request',
        {
          bdata: bdata,
          dth_data: dth_data,
          mrg_data: mrg_data,
          dvc_data: dvc_data,
        })

    }
    getResult();


  }
});


app.get("/login/request/reqdetail/breq/:pid", function (req, res) {
  var pid = parseInt(req.params.pid);
  console.log("Here is passed birth id:", pid);

  if (logged == true) {

    async function getResult() {
      const bdata = await birth_info.find({ rid: pid }).sort({ date_of_birthday_registration: 1 }).select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      console.log(bdata);

    }
    getResult();


  }
}
);

app.get("/login/request/reqdetail/dthreq/:pid", function (req, res) {
  var pid = parseInt(req.params.pid);
  console.log("Here is passed death id:", pid);

  if (logged == true) {
    // var bdata = birth_info.find().sort({date_of_birthday_registration:1}).select({name:1, date_of_birthday_registration:1});

    async function getResult() {
      const bdata = await death_info.find({ rid: pid }).sort({ date_of_birthday_registration: 1 }).select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      console.log(bdata);
      // res.render('views/request', {dthdata:dthdata})

    }
    getResult();


  }
}
);


app.get("/login/request/reqdetail/mrgreq/:pid", function (req, res) {
  var pid = parseInt(req.params.pid);
  console.log("Here is passed marriage id:", pid);

  if (logged == true) {
    // var bdata = birth_info.find().sort({date_of_birthday_registration:1}).select({name:1, date_of_birthday_registration:1});

    async function getResult() {
      const bdata = await marriage_info.find({ rid: pid }).sort({ date_of_birthday_registration: 1 }).select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      console.log(bdata);
      //res.render('views/request', {mrgdata:mrgdata})

    }
    getResult();


  }
}
);

app.get("/login/request/reqdetail/dvcreq/:pid", function (req, res) {
  var pid = parseInt(req.params.pid);
  console.log("Here is passed divorce id:", pid);

  if (logged == true) {
    // var bdata = birth_info.find().sort({date_of_birthday_registration:1}).select({name:1, date_of_birthday_registration:1});

    async function getResult() {
      const bdata = await divorce_info.find({ rid: pid }).sort({ date_of_birthday_registration: 1 }).select({ rid: 1, name: 1, date_of_birthday_registration: 1 });
      console.log(bdata);
      // res.render('views/request', {dvcdata:dvcdata})

    }
    getResult();


  }
}
);





app.post("/login_admin", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  admin.findOne({ email: email }, function (err, foundUser) {
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

app.post("/choice1", function (req, res) {
  return res.render("birth.ejs");
});
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
*/
