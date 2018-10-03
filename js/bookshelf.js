"use strict";

app.init = function () {
    // app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.getStatus();
        app.menu();
    });
};

app.getStatus = function () {

    let readStatus = parseInt(window.location.search.split("?status=")[1]);
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
    dbMember.orderByChild("readStatus").equalTo(readStatus).once("value").then((snapshot) => {
        console.log(snapshot.val());
        let bookSelected = Object.values(snapshot.val());
        let bookKey = Object.keys(snapshot.val());
        for (let i = 0; i < bookSelected.length; i++) {
            let wrapper = app.get(".wrapper");
            let parentDiv = app.createElement("div", "", "", "", "", wrapper);
            let nav = app.createElement("a", "", "", "href", "book.html?id=" + bookKey[i], parentDiv);
            let childDiv = app.createElement("div", "visual-book", "", "", "", nav);
            app.createElement("img", "", "", "src", bookSelected[i].coverURL, childDiv);
            app.createElement("div", "book-title", bookSelected[i].title, "", "", nav);
            app.closeLoading();
        }
    });
};


window.addEventListener("DOMContentLoaded", app.init);