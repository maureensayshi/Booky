"use strict";

import { app } from "./common.js";

app.init = function () {
    app.menu();
};

window.addEventListener("DOMContentLoaded", app.init);