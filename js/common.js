"use strict";
// initialize firebase
firebase.initializeApp({
    apiKey: "AIzaSyALgpVirl6lyBvOK9W--e5QycFeMFzcPLg",
    authDomain: "booky-217508.firebaseapp.com",
    databaseURL: "https://booky-217508.firebaseio.com",
    projectId: "booky-217508",
    storageBucket: "booky-217508.appspot.com",
    messagingSenderId: "757419169220"
});

// initialize app structure
let app = {
    database: firebase.database(),
};

app.checkLogin = function () {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(function (user) {
            console.log("in app.checklogin .......");
            if (user) {
                resolve(user.uid);
                console.log(user.uid);
            } else {
                // User is signed out or haven't sign up.
                reject(window.location = "/");
            }
        });
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
    let shadow = app.get(".menu-shade");

    menu_btn.onclick = function () {
        menu.style.left = "0";
        menu_btn.style.visibility = "hidden";
        shadow.style.left = "0%";
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
        shadow.style.left = "-100%";
    };
};

//search bar
app.searchBar = function () {
    let search_btn = app.get("header .btn_search input");
    let searchPage = app.get(".search-shade");
    let close_search_btn = app.get(".searchbar-img>img");

    search_btn.onclick = function () {
        searchPage.style.visibility = "visible";
        searchPage.style.opacity = "1";
        searchPage.style.filter = "alpha(opacity=100)";
    };

    close_search_btn.onclick = function () {
        searchPage.style.visibility = "hidden";
        searchPage.style.opacity = "0";
        searchPage.style.filter = "alpha(opacity=0)";
    };
};

// loading
app.showLoading = function () {
    app.get("#loading").style.display = "block";
};
app.closeLoading = function () {
    app.get("#loading").style.display = "none";
};

// export { app };



