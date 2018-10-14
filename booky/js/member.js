"use strict";

app.init = function () {
    app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.showMemberInfo();
        app.menu();
        app.searchBar();
        app.addBookInit();
        app.scanBookInit();
        app.logOut();
    });
};

app.showMemberInfo = function () {
    let db = app.database;
    let dbMember = db.ref("/members/" + app.uid);
    dbMember.on("value", function (snapshot) {
        let val = snapshot.val();
        console.log(val);
        let memberName = app.get(".member-info>div:nth-child(1)>span");
        memberName.textContent = val.name;
        let memberEmail = app.get(".member-info>div:nth-child(2)>span");
        memberEmail.textContent = val.email;
        let memberPic = app.get("main .member-img");
        memberPic.style.backgroundImage = `url(${val.photo})`;
        memberPic.style.backgroundSize = "100%";
        app.closeLoading();
    });
};

app.logOut = function () {
    let logout_btn = app.get("#logout");
    logout_btn.onclick = function () {
        firebase.auth().signOut();
    };
};


window.addEventListener("DOMContentLoaded", app.init);