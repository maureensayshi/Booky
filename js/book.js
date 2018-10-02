"use strict";

app.init = function () {
    app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.checkingBook();
        app.menu();
        app.closeLoading();
    });
};

app.checkingBook = function () {
    console.log(app.uid);
};

window.addEventListener("DOMContentLoaded", app.init);