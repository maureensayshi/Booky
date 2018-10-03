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
    let dbMember = db.ref("/members/" + app.uid + "/bookList/" + bookID);
    dbMember.on("value", function (snapshot) {
        let val = snapshot.val();
        console.log(val);
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
            console.log(typeof lendChoices[i].value);
            console.log(lendChoices[i]);

            let lendChoiceDB = lendChoices[i].value === "true" ? true : false;
            console.log(typeof val.lend);
            if (lendChoiceDB == val.lend) {
                lendChoices[i].checked = true;
            }
        }
        app.closeLoading();
        app.editBook(val);
    });

};

app.editBook = function (val) {

    let save_btn = app.get("#save-and-edit");
    save_btn.addEventListener("click", function () {
        let placeInput = app.get("main .book-place input");
        let lendToInput = app.get("main .lend-to input");
        let readChoices = app.getAll("main .reading-status .container input");
        let readChoicesChecked = app.get("main .reading-status .container input:checked");
        let twiceButton = app.get("main .twice-or-not>input");
        let lendChoices = app.getAll("main .lend-or-not .container input");
        let lendChoicesChecked = app.get("main .lend-or-not .container input:checked");

        if (save_btn.value == "更新資料") {
            save_btn.value = "儲存修改";
            save_btn.style.backgroundImage = "url(../img/save.svg)";
            placeInput.disabled = false;
            lendToInput.disabled = false;
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
            lendToInput.disabled = true;
            for (let i = 0; i < readChoices.length; i++) {
                readChoices[i].disabled = true;
            }
            twiceButton.disabled = true;
            for (let i = 0; i < lendChoices.length; i++) {
                lendChoices[i].disabled = true;
                console.log(lendChoices[i].value);
            }

            console.log(placeInput.value); //放置地點 string
            console.log(readChoicesChecked.value); //閱讀狀態數字 0/1/2
            console.log(twiceButton.checked); //值得二讀 true/false
            console.log(lendChoicesChecked.value); //是否有借人 true/false
            console.log(lendToInput.value); //借出對象 string


            //送到db
            console.log(val);

            // db.ref("/members/" + uid).set(memberData, function (error) {
            //     if (error) {
            //         console.log("Error of setting member data.");
            //     } else {
            //         console.log("Set member data okay.");
            //     }
            // }).then(function (res) {
            //     console.log(res);
            // });

            // let dbMember = app.database.ref("/members/" + app.uid + "/bookList/");

            // dbMember.orderByChild("readStatus").equalTo(readStatusNum).once("value").then((snapshot) => {
            //     app.showBook(snapshot.val());
            // }).catch((error) => {
            //     app.get(".wrapper").textContent = "此書櫃暫無書籍";
            //     app.get(".wrapper").style.gridTemplateColumns = "repeat(1, 1fr)";
            //     console.log("no books " + error);
            //     app.closeLoading();
            // });





            console.log("把更新的資料送到db");
        }
    });

};

window.addEventListener("DOMContentLoaded", app.init);