"use strict";
import { app } from "./common.js";

app.init = function () {
    app.menu_open();
    app.menu_close();
    // equipped with multi-options
    // document.multiselect("#testSelect1");
    app.multiSelect();
};

window.addEventListener("DOMContentLoaded", app.init);