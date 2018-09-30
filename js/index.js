"use strict";

import { app } from "./common.js";

app.init = function () {
    app.showLoading();
    // 啟動 firebase
    let firebaseInfo = {
        apiKey: "AIzaSyALgpVirl6lyBvOK9W--e5QycFeMFzcPLg",
        authDomain: "booky-217508.firebaseapp.com",
        databaseURL: "https://booky-217508.firebaseio.com",
        projectId: "booky-217508",
        storageBucket: "booky-217508.appspot.com",
        messagingSenderId: "757419169220"
    };
    let firebaseInit = firebase.initializeApp(firebaseInfo);
    app.checkLoginIndex(firebaseInit);
    app.menu();
    app.keyin_search();
};

app.checkLoginIndex = function (firebaseInit) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            app.get(".welcome").style.display = "none";
            app.get(".real").style.display = "block";
            app.closeLoading();
            // User is signed in.
            console.log("會員登入");
        } else {
            app.get(".welcome").style.display = "block";
            app.get(".real").style.display = "none";
            app.closeLoading();
            app.googleLogin(firebaseInit);
        }
    });
};

app.googleLogin = function (firebaseInit) {
    let gButton = app.get("#google");
    gButton.addEventListener("click", function () {
        app.showLoading();
        if (!firebase.auth().currentUser) {
            let provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope("https://www.googleapis.com/auth/plus.login");
            //啟動 login 程序   
            firebase.auth().signInWithRedirect(provider);
            firebase.auth().getRedirectResult().then(function (result) {
                console.log(result);
                app.closeLoading();
                if (result.user) {
                    let uid = result.user.uid;
                    let name = result.user.displayName;
                    let email = result.user.email;
                    let photo = result.user.photoURL;
                    //prepare member data for DB
                    let memberData = {
                        uid: uid,
                        name: name,
                        email: email,
                        photo: photo,
                        bookList: "hello",
                    };
                    //send member data to DB
                    let db = firebaseInit.database();
                    db.ref("/members/" + uid).set(memberData, function (error) {
                        if (error) {
                            console.log("Error of setting member data.");
                        } else {
                            console.log("Set member data okay.");
                        }
                    }).then(function (res) {
                        console.log(res);
                    });
                }
            }).catch(function (error) {
                console.log(error);
            });
        } else {
            console.log("執行會員登入");
        }
    });
};

app.searchKeyWord = function () {
    let keyWord;
    keyWord = app.get("#keyword").value;
    app.search_book(keyWord);
    console.log(keyWord);
};

app.keyin_search = function () {
    // 直接按 Enter 搜尋
    let formSearch = app.get("#searchForm");
    formSearch.onsubmit = function () {
        let booksParent = app.get(".result");
        booksParent.innerHTML = "";
        booksParent.style.margin = "0px";
        app.searchKeyWord();
        return false;
    };

    // 點擊搜尋鍵搜尋
    let clickKeyInSearch = app.get("#keyin-search");
    clickKeyInSearch.onclick = function () {
        let booksParent = app.get(".result");
        booksParent.innerHTML = "";
        booksParent.style.margin = "0px";
        app.searchKeyWord();
    };

    let searchType = app.get("#search-type");
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
            app.getBookData(data);
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);
            app.get("main .container-two").style.display = "flex";
            app.get(".result").textContent = "無搜尋結果";
            app.get(".result").style.margin = "50px";
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
            app.getBookData(data);
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);
            app.get("main .container-two").style.display = "flex";
            app.get(".result").textContent = "無搜尋結果";
            app.get(".result").style.margin = "50px";
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
            app.getBookData(data);
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);
            app.get("main .container-two").style.display = "flex";
            app.get(".result").textContent = "無搜尋結果";
            app.get(".result").style.margin = "50px";
        });
};

app.getBookData = function (data) {
    // 抓到需要的不同資料
    for (let i = 0; i < data.items.length; i++) {
        let bookTitle;  // 1. 書名
        let bookAuthor;  // 2. 作者
        let bookPublisher; // 3. 出版社
        let bookISBN;  // 4. ISBN-13
        let bookMaxPage; // 5. 總頁數
        let bookCover; // 6. 書封照片
        // console.log(data.items[i].volumeInfo);
        //書名
        let title = data.items[i].volumeInfo.title;
        bookTitle = title; //存取書名       
        //作者 or 作者群
        let authors = data.items[i].volumeInfo.authors;
        bookAuthor = (authors != null) ? authors.join("、") : "暫無資料";
        // console.log(authors);

        //出版社
        let publisher = data.items[i].volumeInfo.publisher;
        bookPublisher = (publisher != null) ? publisher : "暫無資料";
        // ISBN
        let isbn = data.items[i].volumeInfo.industryIdentifiers;
        if (isbn != null) {
            // console.log(isbn);
            let tmpISBN;
            for (let i = 0; i < isbn.length; i++) {
                if (isbn[i].type == "ISBN_13")
                    tmpISBN = isbn[i].identifier;  //console.log(isbn[i].identifier); 
            }
            bookISBN = (tmpISBN != "" && tmpISBN != null) ? tmpISBN : "暫無資料";
        } else if (isbn == null) {
            bookISBN = "暫無資料"; // console.log("印出無 ISBN 13 碼");
        }
        // 最大頁數 pageCount
        let maxPage = data.items[i].volumeInfo.pageCount;
        bookMaxPage = (maxPage != null) ? maxPage : "請輸入總頁數";
        // console.log(bookMaxPage);
        // 書封照片
        let cover = data.items[i].volumeInfo.imageLinks;
        bookCover = (cover != null) ? cover.thumbnail : "https://bit.ly/2ObFgq5";
        app.showBookResult(bookTitle, bookAuthor, bookPublisher, bookISBN, bookMaxPage, bookCover);
    }
};

app.showBookResult = function (bookTitle, bookAuthor, bookPublisher, bookISBN, bookMaxPage, bookCover) {
    app.get("main .container-two").style.display = "flex";
    let booksParent = app.get(".result");
    //each book
    let bookParent = app.createElement("div", "result-book", "", "", "", booksParent);
    let ImageParent = app.createElement("div", "result-book-img", "", "", "", bookParent);
    let showImage = app.createElement("img", "", "", "src", bookCover, ImageParent);
    // each book info
    let bookInfoParent = app.createElement("div", "result-book-info", "", "", "", bookParent);
    let TitleParent = app.createElement("p", "", "書名：", "", "", bookInfoParent);
    let showTitle = app.createElement("span", "", bookTitle, "", "", TitleParent);
    let bookAuthorParent = app.createElement("p", "", "作者：", "", "", bookInfoParent);
    let showAuthor = app.createElement("span", "", bookAuthor, "", "", bookAuthorParent);
    let PublisherParent = app.createElement("p", "", "出版社：", "", "", bookInfoParent);
    let showPublisher = app.createElement("span", "", bookPublisher, "", "", PublisherParent);
    let ISBNParent = app.createElement("p", "", "ISBN-13：", "", "", bookInfoParent);
    let showISBN = app.createElement("span", "", bookISBN, "", "", ISBNParent);
    let addButton = app.createElement("button", "", "加入總書櫃", "", "", bookInfoParent);
};

window.addEventListener("DOMContentLoaded", app.init);
