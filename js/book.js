app.init = function () {
    app.menu_open();
    app.menu_close();
    // equipped with multi-options
    document.multiselect("#testSelect1");

};

window.addEventListener("DOMContentLoaded", app.init);