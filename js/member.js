"use strict";

import { app } from "./common.js";

app.init = function () {
    app.showLoading();
    app.firebase();
    app.checkLogin();
    app.menu();
    app.logOut();
};

app.logOut = function (){
    let logout_btn = app.get("#logout");
    logout_btn.onclick = function(){
        firebase.auth().signOut();
    };
};


window.addEventListener("DOMContentLoaded", app.init);