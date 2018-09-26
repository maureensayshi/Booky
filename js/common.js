"use strict";
// initialize firebase
// firebase.initializeApp({
// 	apiKey: "AIzaSyB8bXw1Xco2dzjTwI1RvjJsMalLXtr8gYo",
// 	projectId: "appworks-school-stylish",
// 	storageBucket: "appworks-school-stylish.appspot.com"
// });

// initialize app structure

let app = {
    // cst:{
    // 	API_HOST:"https://appworks-school-stylish.firebaseapp.com"
    // }
};

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
    let menuList = app.getAll(".menu div");
    let close_menu = app.get(".close-menu");

    menu_btn.onclick = function () {
        menu.style.display = "flex";
        if (window.innerWidth > 1200) {
            menu.style.width = "500px";
        } else if (window.innerWidth < 1200 && window.innerWidth > 980) {
            menu.style.width = "380px";
        } else if (window.innerWidth < 980 && window.innerWidth > 480) {
            menu.style.width = "280px";
        } else if (window.innerWidth < 480 && window.innerWidth > 320) {
            menu.style.width = "200px";
        }
        menu.style.visibility = "visible";
        menu_btn.style.visibility = "hidden";
        close_menu.style.height = "30px";

        setTimeout(function () {
            for (let i = 0; i < menuList.length; i++) {
                // if (window.innerWidth > 1200) {
                //     menuList[i].style.width = "350px";
                // } else if (window.innerWidth < 1200 && window.innerWidth > 980) {
                //     menuList[i].style.width = "266px";
                // } else if (window.innerWidth < 980 && window.innerWidth > 480) {
                //     menuList[i].style.width = "197px";
                // } else if (window.innerWidth < 480 && window.innerWidth > 320) {
                //     menuList[i].style.width = "140px";
                // }
                menuList[i].style.visibility = "visible";
            }
        }, 300);

    };

    close_menu.onclick = function () {
        menu.style.width = "0px";
        menu_btn.style.visibility = "visible";
        close_menu.style.height = "0px";
        // setTimeout(function () {
        for (let i = 0; i < menuList.length; i++) {
            menuList[i].style.visibility = "hidden";
        }
        // }, 350);
    };
};

// choose multi-bookshelf in book.html
app.multiSelect = function () {
    document.multiselect("#testSelect1");
};

export { app };



