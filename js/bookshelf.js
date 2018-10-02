"use strict";

app.init = function () {
    app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.showAll();
        app.menu();
        app.closeLoading();
    });
};

app.showAll = function () {
    console.log(app.uid);
    let db = app.database;
    let dbMember = db.ref("/members/" + app.uid + "/bookList/");
    dbMember.on("value", function (snapshot) {
        let val = snapshot.val();
        console.log(val);
        // let wrapper = app.get(".wrapper");
        // for(let i = 0; i<val.length; i++){

        // }

    });
};

window.addEventListener("DOMContentLoaded", app.init);