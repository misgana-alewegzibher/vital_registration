const express = require('express');
const ptp = require("pdf-to-printer");
const fs = require("fs");
const path = require("path");
const app = express();

var conversion = require("phantomjs")();
conversion({ html: "<h1>Hello World</h1>" }, function(err, pdf) {
  var output = fs.createWriteStream('/test/output.pdf')
  console.log(pdf.logs);
  console.log(pdf.numberOfPages);
	// since pdf.stream is a node.js stream you can use it
	// to save the pdf to a file (like in this example) or to
	// respond an http request.
  pdf.stream.pipe(output);
})
app.listen(6340);
