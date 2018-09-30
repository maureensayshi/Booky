"use strict";

import { app } from "./common.js";

app.init = function () {
    app.showLoading();
    // Initialize Firebase
    let firebaseKey = {
        apiKey: "AIzaSyALgpVirl6lyBvOK9W--e5QycFeMFzcPLg",
        authDomain: "booky-217508.firebaseapp.com",
        databaseURL: "https://booky-217508.firebaseio.com",
        projectId: "booky-217508",
        storageBucket: "booky-217508.appspot.com",
        messagingSenderId: "757419169220"
    };
    let firebaseInit = firebase.initializeApp(firebaseKey);
    app.checkLoginMember(firebaseInit);
};

app.checkLoginMember = function (firebaseInit) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.          
            let uid = user.uid;
            app.showMemberInfo(firebaseInit, uid);
            app.menu();
            app.logOut();
        } else {
            window.location = "/";
            // User is signed out.
        }
    });
};

app.showMemberInfo = function (firebaseInit, uid) {
    let db = firebaseInit.database();
    let dbMember = db.ref("/members/" + uid);
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