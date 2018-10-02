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
            console.log(bookArray);


            let wrapper = app.get(".wrapper");
            for (let i = 0; i < bookArray.length; i++) {
                console.log(bookArray[i].key);
                let parentDiv = app.createElement("div", "", "", "", "", wrapper);
                let childDiv = app.createElement("div", "visual-book", "", "", "", parentDiv);
                app.createElement("img", "", "", "src", bookArray[i].coverURL, childDiv);
                app.createElement("div", "book-title", bookArray[i].title, "", "", parentDiv);
            }
            app.closeLoading();
        } else {
            console.log("no book");
            app.closeLoading();
        }
    });

};

window.addEventListener("DOMContentLoaded", app.init);