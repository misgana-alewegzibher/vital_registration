const express = require('express');
const ptp = require("pdf-to-printer");
const fs = require("fs");
const path = require("path");
// import ptp from "pdf-to-printer";
// import fs from "fs";
// import path from "path";

const app = express();
const port = 4000;

app.post('', express.raw({ type: 'application/pdf' }), async(req, res) => {

    const options = {};
    if (req.query.printer) {
        options.printer = req.query.printer;
    }
    const tmpFilePath = path.join(`./tmp/${Math.random().toString(36).substr(7)}.pdf`);

    fs.writeFileSync(tmpFilePath, req.body, 'binary');
    await ptp.print(tmpFilePath, options);
    fs.unlinkSync(tmpFilePath);

    res.status(204);
    res.send();
});

app.listen(port, () => {
    console.log("PDF Printing Service listening on port ${port}");
});