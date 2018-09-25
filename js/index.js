import { app } from "../js/common.js";

app.init = function () {
    app.menu_open();
    app.menu_close();
    app.keyin_search();
};


app.keyin_search = function () {
    // 設定不同的搜尋方法
    let searchType = app.get("#search-type");
    // let searchTitle = app.get("#search-title");
    // let searchIsbn = app.get("#search-isbn");
    // let searchAuthor = app.get("#search-author");

    // 1. 選擇搜尋方式
    // 2. 使用者填入關鍵字
    // 3. 使用者點擊送出按鈕
    // 4. 依據使用者選擇的搜尋方式，將關鍵字丟入 fetch

    let clickKeyInSearch = app.get("#keyin-search");
    let keyWord;
    clickKeyInSearch.onclick = function () {
        keyWord = app.get("#keyword").value;
        console.log(keyWord);
        app.search_book(keyWord);
    };
    console.log(keyWord);
    app.search_book = function (keyWord) {
        switch (searchType.value) {
        case "search-title":
            app.googleBooks_title(keyWord);
            break;
        case "search-isbn":
            app.googleBooks_isbn(keyWord);
            break;
        case "search-author":
            app.googleBooks_author(keyWord);
            break;
        case "":
            console.log("user didn't key in words");
            break;
        }
    };
};


// 找書名
app.googleBooks_title = function (bookTitle) {

    fetch("https://www.googleapis.com/books/v1/volumes?q=intitle:" + bookTitle + "&maxResults=40&key=AIzaSyAIhKztMyiZescidKArwy41HAZirttLUHg")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            // 抓到需要的不同資料
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);
        });
};

// 找 ISBN
app.googleBooks_isbn = function (bookISBN) {

    fetch("https://www.googleapis.com/books/v1/volumes?q=isbn:" + bookISBN + "&maxResults=40&key=AIzaSyAIhKztMyiZescidKArwy41HAZirttLUHg")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);
        });
};

// 找作者
app.googleBooks_author = function (bookAuthor) {

    fetch("https://www.googleapis.com/books/v1/volumes?q=inauthor:" + bookAuthor + "&maxResults=40&key=AIzaSyAIhKztMyiZescidKArwy41HAZirttLUHg")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);
        });
};

window.addEventListener("DOMContentLoaded", app.init);