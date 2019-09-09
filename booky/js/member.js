"use strict";
import app from "./common.js";

app.init = function () {
    app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.member.info(app.member.showMemberInfo);
        app.menu();
        app.searchBook.Init();
        app.addBook.Init();
        app.scanBook.Init();
        app.googleLogin.logOut();
        app.closeLoading();
    });
};

app.member.info = function (Callback) {
    app.database.ref("/members/" + app.uid).once("value", function (snapshot) {
        Callback(snapshot.val());
    });
};

app.member.showMemberInfo = function (val) {
    app.get("#name").textContent = val.name;
    app.get("#email").textContent = val.email;
    app.get("#pic").style.backgroundImage = `url(${val.photo})`;
    app.get("#pic").style.backgroundSize = "100%";
};

app.googleLogin.logOut = function () {
    app.get("#logout").addEventListener("click", function () {
        firebase.auth().signOut().then(function () {
            window.location = "/";
        }, function (error) {
            //console.log(error);
        });
    });
};

window.addEventListener("DOMContentLoaded", app.init);