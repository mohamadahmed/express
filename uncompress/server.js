/**
 * Web Application for Analyzing Web-Sites
 * Created by mahmed on 10.06.17.
 */
"use strict";
//express js for server connection.
var express = require('express');
//request for get and post web request.
var request = require('request');
//cheerio to load all DOM content of website.
var cheerio = require('cheerio');
//API is intended to be used without body-parser, json, and urlencoded.
var bodyParser = require('body-parser');
//intialised epress
var app = express();
//for parsing application/json
app.use(bodyParser.json());
//for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
//A public directory to load css, images...
app.use(express.static('public'));

//App load view from view directory.
app.set('views', './view');
//App engine set to Effective JavaScript (EJS) template.
app.set('view engine', 'ejs');
//App home route is urlForm page to send any website to check.
app.get('/', function (req, res) {
    res.render('urlForm.ejs', {
        error:"no error"
    });
});

//App received request and website link.
app.post('/pageContent', function (req, res) {
    //request website url.
    var url = req.body.website;
    //current html version of website
    var htmlVersion,
        //count number of from h1-h6 in website.
        headersLength,
        //check a website had form or not.
        checkForm,
        //website heading level from (h1-h6).
        aHeaderLevelContent = [],
        //website internal links
        aInternalLinksArr = [],
        //website External links
        aExternalLinksArr = [],
        //website inaccessible links
        aInaccessibleLinksArr = [];

    //load html website content, handle error and check response
    request(url, function (error, response, html) {

        if (!error && response.statusCode == 200) {
            //load website content.
            var $ = cheerio.load(html);
            //create a reference to the title element
            var sTitle = $('head > title').text();

            checkHtmVersion(html)
            headingLevel($);
            checkLinks($);
            isFormExist($);

            //create page object data
            var oData = {
                htmlVersion: htmlVersion,
                title: sTitle,
                headersLength: headersLength,
                header: aHeaderLevelContent,
                externalLinksArr: aExternalLinksArr,
                internalLinksArr: aInternalLinksArr,
                inaccessibleLinksArr: aInaccessibleLinksArr,
                form: checkForm
            };

            res.render('pageContent.ejs', oData);

        } else {

            //Register some 4xx status code
            if(error.code === "ENOTFOUND"){
                res.status(404);
            } else if (error.code === "ECONNREFUSED") {
                res.status(408);
            } else {
                res.status(400);
            }

            res.render('urlForm.ejs', {
                'error': error.code,
                'errorStatus':res.statusCode
            });
        }
    });
    /**
     * @summary Function to check html version of website
     *
     * @author mahmed
     * @name checkHtmVersion
     * @param {string} html load website in string format.
     * @function
     */
    function checkHtmVersion(html) {
        // regular expression to get doctype tag.
        var regex = "<!DOCTYPE((.|\n|\r)*?)\">"
        var result = html.match(regex);

        if (result && result !== "undefined") {
            if (result[1].indexOf("PUBLIC") !== -1) {
                htmlVersion = "HTML version 4.01 or older"
            } else {
                htmlVersion = "HTML version 5"
            }
        }
    };
    /**
     * @summary Function to lengths of headings and number of heading levels.
     *
     * @author mahmed
     * @name headingLevel
     * @param {object} $ An object of current website.
     * @function
     */
    function headingLevel($) {
        //create a reference to the header element
        var oHeaders = $(':header');
        if (oHeaders && oHeaders.length !== "undefined") {
            headersLength = oHeaders.length;
        } else {
            headersLength = "null";
        }
        $(oHeaders).each(function (i, header) {
            if (header.name) {
                aHeaderLevelContent.push(header.name);
            }
        });

    };
    /**
     * @summary Function to lengths of headings and number of heading levels.
     *
     * @author mahmed
     * @name isFormExist
     * @param {object} $ An object of current website.
     * @function
     */
    function isFormExist($) {
        var form = $('form').html();
        if (form) {
            checkForm = "Form Exist!!!";
        } else {
            checkForm = "Form Not Exist!!!"
        }
    };
    /**
     * @summary Function to lengths of headings and number of heading levels.
     *
     * @author mahmed
     * @name checkLinks
     * @param {object} $ An object of current website.
     * @function
     */
    function checkLinks($) {
        //regex for url
        var urlParts = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(url);
        // www.example.com
        var hostname = urlParts[1];
        // get all hyperlinks in website
        var links = $('a');
        // A current link to check in website.
        var currentLink;
        $(links).each(function (i, link) {
            currentLink = $(link).attr("href");

            if (currentLink && currentLink !== "undefined") {
                //current links matches host name.
                if (currentLink.indexOf(hostname) !== -1) {
                    aInternalLinksArr.push({
                        "href": currentLink,
                        "text": $(link).text()
                    })
                    //current links matches relative name.
                } else if (currentLink.slice(0, 1) == "/") {
                    aInternalLinksArr.push({
                        "href": currentLink,
                        "text": $(link).text()
                    });
                    //current links matches anchor #.
                } else if (currentLink.slice(0, 1) == "#") {
                    // It's an anchor link
                    aInaccessibleLinksArr.push({
                        "href": currentLink,
                        "text": $(link).text()
                    });
                } else {
                    //current links is external links.
                    aExternalLinksArr.push({
                        "href": currentLink,
                        "text": $(link).text()
                    });
                }
            }
        });

    };

});

app.listen(3000);


