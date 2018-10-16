"use strict";

app.init = function () {
    app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.showBook();
        app.menu();
        app.searchBar();
        app.addBookInit();
        app.scanBookInit();
    });
};

app.showBook = function () {
    let bookID = location.search.split("id=")[1];
    console.log(bookID);
    let db = app.database;
    let dbBookList = db.ref("/members/" + app.uid + "/bookList/" + bookID);
    dbBookList.once("value", function (snapshot) {
        let val = snapshot.val();
        // console.log(val);
        app.get("main .visual-book>img").src = val.coverURL;
        app.get("#title").textContent = val.title;
        app.get("#author").textContent = val.authors.join("、");
        app.get("#publisher").textContent = val.publisher;
        //顯示資料庫原本的資料
        app.get("main .book-place input").value = val.place;
        app.get("main .lend-to input").value = val.lendTo;

        let readChoices = app.getAll("main .reading-status .container input");
        for (let i = 0; i < readChoices.length; i++) {
            if (readChoices[i].value == val.readStatus) {
                readChoices[i].checked = true;
            }
        }
        let twiceChoices = app.getAll("main .twice-or-not .container input");
        for (let i = 0; i < twiceChoices.length; i++) {
            let twiceChoiceDB = twiceChoices[i].value === "true" ? true : false;
            if (twiceChoiceDB == val.twice) {
                twiceChoices[i].checked = true;
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

    //儲存/修改資料
    save_btn.addEventListener("click", function () {

        //radio邊框
        let readingCheckAll = app.getAll("main .reading-status .checkmark");
        let twiceCheckAll = app.getAll("main .twice-or-not .checkmark");
        let lendCheckAll = app.getAll("main .lend-or-not .checkmark");

        let placeInput = app.get("main .book-place input");
        let lendToInput = app.get("main .lend-to input");
        let readChoices = app.getAll("main .reading-status .container input");
        let readChoicesChecked = app.get("main .reading-status .container input:checked");
        let twiceChoices = app.getAll("main .twice-or-not .container input");
        let twiceChoicesChecked = app.get("main .twice-or-not .container input:checked");
        let lendChoices = app.getAll("main .lend-or-not .container input");
        let lendChoicesChecked = app.get("main .lend-or-not .container input:checked");

        if (save_btn.value == "更新資料") {
            save_btn.value = "儲存修改";
            save_btn.style.backgroundImage = "url(img/save.svg)";

            for (let i = 0; i < readingCheckAll.length; i++) {
                readingCheckAll[i].style.border = "1px solid #ececec";
                readingCheckAll[i].style.backgroundColor = "white";
            }
            for (let i = 0; i < twiceCheckAll.length; i++) {
                twiceCheckAll[i].style.border = "1px solid #ececec";
                twiceCheckAll[i].style.backgroundColor = "white";
            }
            for (let j = 0; j < lendCheckAll.length; j++) {
                lendCheckAll[j].style.border = "1px solid #ececec";
                lendCheckAll[j].style.backgroundColor = "white";
            }

            placeInput.disabled = false;
            lendToInput.disabled = false;
            placeInput.className = placeInput.disabled ? "input-init" : "input-edit";
            lendToInput.className = placeInput.disabled ? "input-init" : "input-edit";
            for (let i = 0; i < readChoices.length; i++) {
                readChoices[i].disabled = false;
            }
            for (let i = 0; i < twiceChoices.length; i++) {
                twiceChoices[i].disabled = false;
            }
            for (let i = 0; i < lendChoices.length; i++) {
                lendChoices[i].disabled = false;
            }
        } else if (save_btn.value == "儲存修改") {
            save_btn.value = "更新資料";
            save_btn.style.backgroundImage = "url(img/edit.svg)";

            for (let i = 0; i < readingCheckAll.length; i++) {
                readingCheckAll[i].style.border = "0";
                readingCheckAll[i].style.backgroundColor = "#F8F8F4";
            }
            for (let i = 0; i < twiceCheckAll.length; i++) {
                twiceCheckAll[i].style.border = "0";
                twiceCheckAll[i].style.backgroundColor = "#F8F8F4";
            }
            for (let j = 0; j < lendCheckAll.length; j++) {
                lendCheckAll[j].style.border = "0";
                lendCheckAll[j].style.backgroundColor = "#F8F8F4";
            }

            placeInput.disabled = true;
            placeInput.className = placeInput.disabled ? "input-init" : "input-edit";
            lendToInput.className = placeInput.disabled ? "input-init" : "input-edit";

            for (let i = 0; i < readChoices.length; i++) {
                readChoices[i].disabled = true;
            }
            for (let i = 0; i < twiceChoices.length; i++) {
                twiceChoices[i].disabled = true;
                console.log(twiceChoices[i].value);
            }
            let twiceChoiceSelected = twiceChoicesChecked.value === "true" ? true : false;
            console.log(twiceChoiceSelected);

            for (let i = 0; i < lendChoices.length; i++) {
                lendChoices[i].disabled = true;
                console.log(lendChoices[i].value);
            }
            let lendChoiceSelected = lendChoicesChecked.value === "true" ? true : false;

            //重新賦值書籍資料
            val.place = placeInput.value; //放置地點 string
            val.readStatus = readChoicesChecked.value; //閱讀狀態數字 0/1/2 string
            val.twice = twiceChoiceSelected; //值得二讀 true/false
            val.lend = lendChoiceSelected; //是否有借人 true/false
            val.lendTo = lendChoiceSelected == true ? lendToInput.value : "無"; //借出對象 string

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

    //刪除書籍
    let delete_btn = app.get("#delete");

    delete_btn.addEventListener("click", function () {
        //重新傳回資料庫
        dbBookList.remove(function (error) {
            if (error) {
                console.log("刪除書籍失敗");
            } else {
                console.log("刪除此書!");
                alert("刪除此書!");
                window.location = "bookshelf.html?status=all";
            }
        });
    });

};


window.addEventListener("DOMContentLoaded", app.init);