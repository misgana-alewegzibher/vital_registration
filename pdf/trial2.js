
var page = require('webpage');

page.open('http://127.0.0.1:4000/', function (status) {

    page.render('Before.png');

    console.log(page.url);

    this.evaluate(function () {

        document.querySelector('input[name="btnI"]').click();

    });

    window.setTimeout(function () {

        console.log(page.url);

        page.render('After.png');

        phantom.exit();

    }, 10000);

    console.log('element is ' + element);

});


//var page = new WebPage();

// const page = require('webpage');

// page.open('http://127.0.0.1:4000/', function(status) {

// page.render('Before.png');

// console.log(page.url);

// this.evaluate(function() {

// document.querySelector('input[name="btnI"]').click();

// });

// window.setTimeout(function () {

// console.log(page.url);

// page.render('After.png');

// phantom.exit();

// }, 10000));

