"use strict";

app.init = function () {
    app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.showMemberInfo();
        app.menu();
        app.searchBar();
        app.addBook.Init();
        app.scanBook.Init();
        app.logOut();
    });
};

app.showMemberInfo = function () {
    app.database.ref("/members/" + app.uid).once("value", function (snapshot) {
        let val = snapshot.val();
        // let memberName = app.get(".member-info>div:nth-child(1)>span");
        app.get("#name").textContent = val.name;
        // let memberEmail = app.get(".member-info>div:nth-child(2)>span");
        app.get("#email").textContent = val.email;
        // let memberPic = app.get("main .member-img");
        app.get("#pic").style.backgroundImage = `url(${val.photo})`;
        app.get("#pic").style.backgroundSize = "100%";
        app.closeLoading();
    });
};

app.logOut = function () {
    let logout_btn = app.get("#logout");
    logout_btn.onclick = function () {
        firebase.auth().signOut().then(function () {
            window.location = "/";
        }, function (error) {
            console.log(error);
        });
    };
};


window.addEventListener("DOMContentLoaded", app.init);