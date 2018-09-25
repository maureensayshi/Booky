import { app } from "../js/common.js";

app.init = function () {
    app.menu_open();
    app.menu_close();
};


let searchSelect = app.get("#search-type");
let searchOption = searchSelect.options[searchSelect.selectedIndex].value;
console.log(searchOption);


// 找書名
fetch("https://www.googleapis.com/books/v1/volumes?q=intitle:別等到被欺負了才懂這些事&maxResults=40&key=AIzaSyAIhKztMyiZescidKArwy41HAZirttLUHg")
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
    })
    .catch(function (error) {
        console.log("error : can't fetch to google books API" + error);
    });


// 找 ISBN
fetch("https://www.googleapis.com/books/v1/volumes?q=isbn:9789861775883&maxResults=40&key=AIzaSyAIhKztMyiZescidKArwy41HAZirttLUHg")
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
    })
    .catch(function (error) {
        console.log("error : can't fetch to google books API" + error);
    });



// 找作者

fetch("https://www.googleapis.com/books/v1/volumes?q=inauthor:金庸&maxResults=40&key=AIzaSyAIhKztMyiZescidKArwy41HAZirttLUHg")
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
    })
    .catch(function (error) {
        console.log("error : can't fetch to google books API" + error);
    });


window.addEventListener("DOMContentLoaded", app.init);