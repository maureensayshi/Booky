"use strict";

app.init = function () {
    app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.getStatus();
        app.menu();
    });
};

app.getStatus = function () {

    let readStatus = window.location.search.split("?status=")[1];
    console.log(readStatus);
    let bsTitle = app.get(".view>h2");
    if (readStatus == "all") {
        bsTitle.textContent = "總書櫃";
    } else if (readStatus == 0) {
        bsTitle.textContent = "未讀";
    } else if (readStatus == 1) {
        bsTitle.textContent = "閱讀中";
    } else if (readStatus == 2) {
        bsTitle.textContent = "已讀";
    } else if (readStatus == "twice") {
        bsTitle.textContent = "值得二讀";
    } else if (readStatus == "lend") {
        bsTitle.textContent = "出借的書";
    }
    app.allocateBS(readStatus);
};

app.allocateBS = function (readStatus) {

    let dbMember = app.database.ref("/members/" + app.uid + "/bookList/");
    if (readStatus >= 0) {
        dbMember.orderByChild("readStatus").equalTo(readStatus).once("value").then((snapshot) => {
            app.showBook(snapshot.val());
        }).catch((error) => {
            app.get(".wrapper").textContent = "此書櫃暫無書籍";
            app.get(".wrapper").style.gridTemplateColumns = "repeat(1, 1fr)";
            console.log("no books " + error);
            app.closeLoading();
        });
    } else if (readStatus == "all") {
        dbMember.orderByChild("readStatus").once("value").then((snapshot) => {
            app.showBook(snapshot.val());
        }).catch((error) => {
            console.log("no books " + error);
            app.get(".wrapper").textContent = "此書櫃暫無書籍";
            app.get(".wrapper").style.gridTemplateColumns = "repeat(1, 1fr)";
            app.closeLoading();
        });
    } else if (readStatus == "twice") {
        dbMember.orderByChild("twice").equalTo(true).once("value").then((snapshot) => {
            app.showBook(snapshot.val());
        }).catch((error) => {
            console.log("no books " + error);
            app.get(".wrapper").textContent = "此書櫃暫無書籍";
            app.get(".wrapper").style.gridTemplateColumns = "repeat(1, 1fr)";
            app.closeLoading();
        });
    } else if (readStatus == "lend") {
        dbMember.orderByChild("lend").equalTo(true).once("value").then((snapshot) => {
            app.showBook(snapshot.val());
        }).catch((error) => {
            console.log("no books " + error);
            app.get(".wrapper").textContent = "此書櫃暫無書籍";
            app.get(".wrapper").style.gridTemplateColumns = "repeat(1, 1fr)";
            app.closeLoading();
        });
    }
};

app.showBook = function (bookList) {
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

window.addEventListener("DOMContentLoaded", app.init);