"use strict";

app.init = function () {
    app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.showBook();
        app.menu();
        app.closeLoading();
    });
};

app.showBook = function () {
    let bookID = location.search.split("id=")[1];
    console.log(bookID);
    let db = app.database;
    let dbMember = db.ref("/members/" + app.uid + "/bookList/" + bookID);
    dbMember.on("value", function (snapshot) {
        let val = snapshot.val();
        console.log(val);
        app.get("main .visual-book>img").src = val.coverURL;
        app.get("#title").textContent = val.title;
        app.get("#author").textContent = val.authors.join("、");
        app.get("#publisher").textContent = val.publisher;
    });
};

window.addEventListener("DOMContentLoaded", app.init);