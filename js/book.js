"use strict";

app.init = function () {
    app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.showBook();
        app.menu();
    });
};

app.showBook = function () {
    let bookID = location.search.split("id=")[1];
    console.log(bookID);
    let db = app.database;
    let dbBookList = db.ref("/members/" + app.uid + "/bookList/" + bookID);
    dbBookList.on("value", function (snapshot) {
        let val = snapshot.val();
        // console.log(val);
        app.get("main .visual-book>img").src = val.coverURL;
        app.get("#title").textContent = val.title;
        app.get("#author").textContent = val.authors.join("、");
        app.get("#publisher").textContent = val.publisher;
        //顯示資料庫原本的資料
        app.get("main .book-place input").value = val.place;
        app.get("main .lend-to input").value = val.lendTo;
        app.get("main .twice-or-not>input").checked = val.twice;
        let readChoices = app.getAll("main .reading-status .container input");
        for (let i = 0; i < readChoices.length; i++) {
            if (readChoices[i].value == val.readStatus) {
                readChoices[i].checked = true;
            }
        }
        let lendChoices = app.getAll("main .lend-or-not .container input");
        for (let i = 0; i < lendChoices.length; i++) {
            let lendChoiceDB = lendChoices[i].value === "true" ? true : false;
            if (lendChoiceDB == val.lend) {
                lendChoices[i].checked = true;
            }
        }
        app.closeLoading();
        app.editBook(val, dbBookList);
    });
};

app.editBook = function (val, dbBookList) {

    let save_btn = app.get("#save-and-edit");
    save_btn.addEventListener("click", function () {
        let placeInput = app.get("main .book-place input");
        let lendToInput = app.get("main .lend-to input");
        let readChoices = app.getAll("main .reading-status .container input");
        let readChoicesChecked = app.get("main .reading-status .container input:checked");
        let twiceButton = app.get("main .twice-or-not>input");
        let lendChoices = app.getAll("main .lend-or-not .container input");
        let lendChoicesChecked = app.get("main .lend-or-not .container input:checked");
        // placeInput.className = placeInput.disabled ? "input-init" : "input-edit";
        if (save_btn.value == "更新資料") {
            save_btn.value = "儲存修改";
            save_btn.style.backgroundImage = "url(../img/save.svg)";
            // app.get("main").classList.add("edit");
            // placeInput.classList.remove("main" + " book-place input");
            // placeInput.classList.add("edit");
            placeInput.disabled = false;
            lendToInput.disabled = false;
            placeInput.className = placeInput.disabled ? "input-init" : "input-edit";
            lendToInput.className = placeInput.disabled ? "input-init" : "input-edit";
            for (let i = 0; i < readChoices.length; i++) {
                readChoices[i].disabled = false;
            }
            twiceButton.disabled = false;
            for (let i = 0; i < lendChoices.length; i++) {
                lendChoices[i].disabled = false;
            }
        } else if (save_btn.value == "儲存修改") {
            save_btn.value = "更新資料";
            save_btn.style.backgroundImage = "url(../img/edit.svg)";
            placeInput.disabled = true;
            placeInput.className = placeInput.disabled ? "input-init" : "input-edit";
            lendToInput.className = placeInput.disabled ? "input-init" : "input-edit";

            for (let i = 0; i < readChoices.length; i++) {
                readChoices[i].disabled = true;
            }
            twiceButton.disabled = true;
            for (let i = 0; i < lendChoices.length; i++) {
                lendChoices[i].disabled = true;
                console.log(lendChoices[i].value);
            }
            let lendChoiceSelected = lendChoicesChecked.value === "true" ? true : false;
            // console.log(placeInput.value); //放置地點 string
            // console.log(readChoicesChecked.value); //閱讀狀態數字 0/1/2
            // console.log(twiceButton.checked); //值得二讀 true/false
            // console.log(typeof lendChoicesChecked.value); //是否有借人 true/false
            // console.log(lendToInput.value); //借出對象 string
            //重新賦值給資料庫
            val.place = placeInput.value;
            val.readStatus = readChoicesChecked.value;
            val.twice = twiceButton.checked;
            val.lend = lendChoiceSelected;
            val.lendTo = lendChoiceSelected == true ? lendToInput.value : "";
            // console.log(val);
            //重新傳回資料庫
            dbBookList.set(val, function (error) {
                if (error) {
                    console.log("更新書不成功");
                } else {
                    console.log("更新書成功");
                    alert("書籍更新資料!");
                }
            });
        }
    });

};

window.addEventListener("DOMContentLoaded", app.init);