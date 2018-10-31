"use strict";

app.init = function () {
    app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.bookShelf.getCategory();
        app.menu();
        app.searchBook.Init();
        app.addBook.Init();
        app.scanBook.Init();
    });
};

app.bookShelf.getCategory = function () {
    app.readStatus = window.location.search.split("?status=")[1];
    let bsTitle = app.get(".view>h2");
    if (app.readStatus == "all") {
        bsTitle.textContent = "總書櫃  /  ALL";
    } else if (app.readStatus == 0) {
        bsTitle.textContent = "未讀 / UNREAD";
    } else if (app.readStatus == 1) {
        bsTitle.textContent = "閱讀中 / READING";
    } else if (app.readStatus == 2) {
        bsTitle.textContent = "已讀 / READ";
    } else if (app.readStatus == "twice") {
        bsTitle.textContent = "值得二讀 / TWICE";
    } else if (app.readStatus == "lend") {
        bsTitle.textContent = "出借的書 / LENT";
    }
    app.bookShelf.allocateBS();
};

app.bookShelf.allocateBS = function () {
    app.get(".wrapper").innerHTML = "";
    let dbMember = app.database.ref("/members/" + app.uid + "/bookList/");
    if (app.readStatus >= 0) {
        dbMember.orderByChild("readStatus").equalTo(app.readStatus).once("value").then((snapshot) => {
            app.bookShelf.showBook(snapshot.val());
        }).catch((error) => {
            app.bookShelf.noBookHandler(error);
        });
    } else if (app.readStatus === "all") {
        dbMember.orderByChild("readStatus").once("value").then((snapshot) => {
            app.bookShelf.showBook(snapshot.val());
        }).catch((error) => {
            app.bookShelf.noBookHandler(error);
        });
    } else if (app.readStatus === "twice") {
        dbMember.orderByChild("twice").equalTo(true).once("value").then((snapshot) => {
            app.bookShelf.showBook(snapshot.val());
        }).catch((error) => {
            app.bookShelf.noBookHandler(error);
        });
    } else if (app.readStatus === "lend") {
        dbMember.orderByChild("lend").equalTo(true).once("value").then((snapshot) => {
            app.bookShelf.showBook(snapshot.val());
        }).catch((error) => {
            app.bookShelf.noBookHandler(error);
        });
    }
};

app.bookShelf.showBook = function (bookList) {
    let bookSelected = Object.values(bookList);
    let bookKey = Object.keys(bookList);
    for (let i = 0; i < bookSelected.length; i++) {
        let wrapper = app.get(".wrapper");
        let parentDiv = app.createElement("div", "", "", "", "", wrapper);
        let nav = app.createElement("a", "", "", "href", "book.html?id=" + bookKey[i], parentDiv);
        let childDiv = app.createElement("div", "visual-book", "", "", "", nav);
        app.createElement("img", "", "", "src", bookSelected[i].coverURL, childDiv);
        app.createElement("div", "book-title", bookSelected[i].title, "", "", nav);
        app.closeLoading();
    }
};

app.bookShelf.noBookHandler = function () {
    app.get(".wrapper").textContent = "此書櫃暫無書籍";
    app.get(".wrapper").style.gridTemplateColumns = "repeat(1, 1fr)";
    app.closeLoading();
};

window.addEventListener("DOMContentLoaded", app.init);