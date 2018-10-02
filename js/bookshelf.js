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
                let parentDiv = app.createElement("div", "", "", "", "", wrapper);
                let nav = app.createElement("a", "", "", "href", "book.html?id=" + bookKey[i], parentDiv);
                let childDiv = app.createElement("div", "visual-book", "", "", "", nav);
                app.createElement("img", "", "", "src", bookArray[i].coverURL, childDiv);
                app.createElement("div", "book-title", bookArray[i].title, "", "", nav);
            }
            app.closeLoading();
        } else {
            console.log("no book");
            app.closeLoading();
        }
    });

};

window.addEventListener("DOMContentLoaded", app.init);