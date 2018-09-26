"use strict";
import { app } from "./common.js";

app.init = function () {
    app.menu_open();
    app.menu_close();
    app.multiSelect();
};

window.addEventListener("DOMContentLoaded", app.init);