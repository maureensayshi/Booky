"use strict";
import { app } from "./common.js";

app.init = function () {
    app.menu();
    app.multiSelect();
};

window.addEventListener("DOMContentLoaded", app.init);