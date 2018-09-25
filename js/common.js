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

app.createElement = function (tagName, class_Name, text_Content, parentElement) {
    let obj = document.createElement(tagName);
    obj.className = class_Name;
    obj.textContent = text_Content;
    if (parentElement instanceof Element) { parentElement.appendChild(obj); }
    return obj;
};

// menu open / close
app.menu_open = function(){
    let menu_btn = app.get(".btn_menu");
    let menu = app.get(".menu");
    menu_btn.onclick = function () {
        menu.style.display = "flex";
        menu_btn.style.visibility = "hidden";
    };
};

app.menu_close = function(){
    let menu_btn = app.get(".btn_menu");
    let menu = app.get(".menu");
    let close_menu = app.get(".close-menu");
    close_menu.onclick = function () {
        menu.style.display = "none";
        menu_btn.style.visibility = "";
    };
};

// equipped with multi-options
document.multiselect("#testSelect1");







