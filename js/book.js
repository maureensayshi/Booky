"use strict";
import { app } from "./common.js";

app.init = function () {
    app.showLoading();
    app.firebase();
    app.checkLogin();
    app.menu();
};

window.addEventListener("DOMContentLoaded", app.init);