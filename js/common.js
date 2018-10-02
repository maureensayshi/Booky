"use strict";

// initialize app structure
let app = {
    // cst:{
    // 	API_HOST:"https://appworks-school-stylish.firebaseapp.com"
    // }
};

app.firebase = function () {
    // Initialize Firebase
    let firebaseKey = {
        apiKey: "AIzaSyALgpVirl6lyBvOK9W--e5QycFeMFzcPLg",
        authDomain: "booky-217508.firebaseapp.com",
        databaseURL: "https://booky-217508.firebaseio.com",
        projectId: "booky-217508",
        storageBucket: "booky-217508.appspot.com",
        messagingSenderId: "757419169220"
    };
    return firebase.initializeApp(firebaseKey);
};

// check login status on every page
app.checkLogin = function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            app.closeLoading();
            // User is signed in.
            let name = user.displayName;
            let email = user.email;
            let photoURL = user.photoURL;
            let uid = user.uid;
            console.log(name);
            console.log(email);
            console.log(photoURL);
            console.log(uid);
        } else {
            window.location = "/";
            // User is signed out.
        }
    });
};

// Other Func

app.get = function (selector) {
    return document.querySelector(selector);
};
app.getAll = function (selector) {
    return document.querySelectorAll(selector);
};

app.createElement = function (tagName, class_Name, text_Content, attr, attrText, parentElement) {
    let obj = document.createElement(tagName);
    obj.className = class_Name;
    obj.textContent = text_Content;
    obj[attr] = attrText;
    if (parentElement instanceof Element) { parentElement.appendChild(obj); }
    return obj;
};

// menu open and close
app.menu = function () {
    let menu_btn = app.get(".btn_menu");
    let menu = app.get(".menu");
    let close_menu = app.get(".close-menu");

    menu_btn.onclick = function () {
        menu.style.left = "0";
        menu_btn.style.visibility = "hidden";
    };

    close_menu.onclick = function () {
        if (window.innerWidth > 1200) {
            menu.style.left = "-400px";
        } else if (window.innerWidth < 1200 && window.innerWidth > 980) {
            menu.style.left = "-320px";
        } else if (window.innerWidth < 980 && window.innerWidth > 480) {
            menu.style.left = "-250px";
        } else if (window.innerWidth < 480 && window.innerWidth >= 320) {
            menu.style.left = "-180px";
        }
        menu_btn.style.visibility = "visible";
    };
};

// loading
app.showLoading = function () {
    app.get("#loading").style.display = "block";
};
app.closeLoading = function () {
    app.get("#loading").style.display = "none";
};

export { app };



