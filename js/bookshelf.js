"use strict";

app.init = function () {
    app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.checkingBS();
        app.menu();
        app.closeLoading();
    });
};

app.checkingBS = function () {
    console.log(app.uid);
};

window.addEventListener("DOMContentLoaded", app.init);