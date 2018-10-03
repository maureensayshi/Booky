"use strict";

app.init = function () {
    app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.showAll();
        app.menu();

    });
};

app.showAll = function () {
    console.log(app.uid);
    let db = app.database;
    let dbMember = db.ref("/members/" + app.uid + "/bookList/");
    dbMember.on("value", function (snapshot) {
        let val = snapshot.val();
        if (val) {
            console.log(val);
            let bookArray = Object.values(val);
            let bookKey = Object.keys(val);

            let wrapper = app.get(".wrapper");

            for (let i = 0; i < bookArray.length; i++) {
                if (window.location.search == "?status=0") {
                    if (bookArray[i].readStatus == 0) {
                        app.createBook(wrapper, bookArray, bookKey, i);
                        app.closeLoading();
                    }
                } else if (window.location.search == "?status=1") {
                    if (bookArray[i].readStatus == 1) {
                        app.createBook(wrapper, bookArray, bookKey, i);
                        app.closeLoading();
                    }
                    app.closeLoading();
                } else if (window.location.search == "?status=2") {
                    if (bookArray[i].readStatus == 2) {
                        app.createBook(wrapper, bookArray, bookKey, i);
                        app.closeLoading();
                    }
                } else if (window.location.search == "?status=all") {
                    if (bookArray[i].readStatus) {
                        app.createBook(wrapper, bookArray, bookKey, i);
                        app.closeLoading();
                    }
                } else if (window.location.search == "?status=twice") {
                    if (bookArray[i].twice) {
                        app.createBook(wrapper, bookArray, bookKey, i);
                        app.closeLoading();
                    }
                }
            }

        } else {
            console.log("no book");
            app.closeLoading();
        }
    });

};

app.createBook = function (wrapper, bookArray, bookKey, i) {
    let parentDiv = app.createElement("div", "", "", "", "", wrapper);
    let nav = app.createElement("a", "", "", "href", "book.html?id=" + bookKey[i], parentDiv);
    let childDiv = app.createElement("div", "visual-book", "", "", "", nav);
    app.createElement("img", "", "", "src", bookArray[i].coverURL, childDiv);
    app.createElement("div", "book-title", bookArray[i].title, "", "", nav);
};

window.addEventListener("DOMContentLoaded", app.init);