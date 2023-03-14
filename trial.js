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
    checkFileTypeMrg(file, cb);
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

const childUploadFunc = childUpload.fields([{ name: 'childUserImg', maxCount: 1 }, { name: 'childUserImg2', maxCount: 1 }]);



  // const brthUpload = upload.fields([{ name: 'bUserImg', maxCount: 1 }, { name: 'bUserImg2', maxCount: 1 }]);

