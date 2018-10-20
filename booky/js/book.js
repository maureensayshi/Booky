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
    app.bookID = bookID;
    console.log(bookID);
    let db = app.database;
    let dbBookList = db.ref("/members/" + app.uid + "/bookList/" + bookID);
    dbBookList.once("value", function (snapshot) {
        let val = snapshot.val();
        app.get("#calLink").href = val.calLink;
        app.calLink = val.calLink;
        console.log(val.calLink);
        if (val.calLink != "") {
            app.get("#calendar").style.display = "none";
        }

        // console.log(val);
        app.get("main .visual-book>img").src = val.coverURL;
        app.get("#title").textContent = val.title;
        app.bookTitle = val.title;
        app.get("#author").textContent = val.authors.join("、");
        app.get("#publisher").textContent = val.publisher;
        //顯示資料庫原本的資料
        app.get("main .book-place input").value = val.place;
        app.get("main .lend-to input").value = val.lendTo;

        //顯示狀態
        let currentRead = app.get(".current-read");
        let currentTwice = app.get(".current-twice");
        let currentLent = app.get(".current-lent");

        if (val.readStatus == 0) {
            currentRead.textContent = "未讀";
        } else if (val.readStatus == 1) {
            currentRead.textContent = "閱讀中";
        } else if (val.readStatus == 2) {
            currentRead.textContent = "已讀";
        }

        if (val.twice == true) {
            currentTwice.textContent = "是";
        } else if (val.twice == false) {
            currentTwice.textContent = "否";
        }

        if (val.lend == true) {
            currentLent.textContent = "是";
        } else if (val.lend == false) {
            currentLent.textContent = "否";
        }

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
        let container = app.getAll(".container");
        //現在狀態
        let currentRead = app.get(".current-read");
        let currentTwice = app.get(".current-twice");
        let currentLent = app.get(".current-lent");

        let readStatusBox = app.get(".status-choice");
        let placeInput = app.get("main .book-place input");
        let lendToInput = app.get("main .lend-to input");
        let readChoices = app.getAll("main .reading-status .container input");
        let readChoicesChecked = app.get("main .reading-status .container input:checked");
        let twiceChoices = app.getAll("main .twice-or-not .container input");
        let twiceChoicesChecked = app.get("main .twice-or-not .container input:checked");
        let lendChoices = app.getAll("main .lend-or-not .container input");
        let lendChoicesChecked = app.get("main .lend-or-not .container input:checked");
        let lentStatus = app.get("#lent");
        let lentNo = app.get("#nolent");

        if (save_btn.value == "更新資料") {
            save_btn.value = "儲存修改";
            save_btn.style.backgroundImage = "url(img/save.svg)";
            readStatusBox.style.display = "flex";
            currentRead.style.display = "none";
            currentTwice.style.display = "none";
            currentLent.style.display = "none";

            for (let i = 0; i < container.length; i++) {
                container[i].style.opacity = "1";
            }
            for (let i = 0; i < readChoices.length; i++) {
                readChoices[i].disabled = false;
            }
            for (let i = 0; i < twiceChoices.length; i++) {
                twiceChoices[i].disabled = false;
            }
            for (let i = 0; i < lendChoices.length; i++) {
                lendChoices[i].disabled = false;
            }

            placeInput.disabled = false;
            placeInput.className = placeInput.disabled ? "input-init" : "input-edit";

            if (lendChoicesChecked.value == "true") {
                lendToInput.disabled = false;
                lendToInput.className = lendToInput.disabled ? "input-init" : "input-edit";
            }

            lentStatus.onclick = function () {
                lendToInput.disabled = false;
                lendToInput.className = lendToInput.disabled ? "input-init" : "input-edit";
            };

            lentNo.onclick = function () {
                lendToInput.disabled = true;
                lendToInput.className = lendToInput.disabled ? "input-init" : "input-edit";
                lendToInput.value = "無";
            };
        } else if (save_btn.value == "儲存修改") {
            save_btn.value = "更新資料";
            save_btn.style.backgroundImage = "url(img/edit.svg)";
            readStatusBox.style.display = "none";
            currentRead.style.display = "block";
            currentTwice.style.display = "block";
            currentLent.style.display = "block";

            for (let i = 0; i < container.length; i++) {
                container[i].style.opacity = "0";
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

            if (val.readStatus == 0) {
                currentRead.textContent = "未讀";
            } else if (val.readStatus == 1) {
                currentRead.textContent = "閱讀中";
            } else if (val.readStatus == 2) {
                currentRead.textContent = "已讀";
            }

            if (val.twice == true) {
                currentTwice.textContent = "是";
            } else if (val.twice == false) {
                currentTwice.textContent = "否";
            }

            if (val.lend == true) {
                currentLent.textContent = "是";
            } else if (val.lend == false) {
                currentLent.textContent = "否";
            }

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


app.handleClientLoad = function () {
    gapi.load("client:auth2", app.initClient);
};

app.initClient = function () {
    app.clientId = "757419169220-9ehr4saki2pbqpp4c2imqa3qd8nbuf0q.apps.googleusercontent.com";
    app.apiKey = "AIzaSyALgpVirl6lyBvOK9W--e5QycFeMFzcPLg";
    app.discoveryDoc = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
    app.scopes = "https://www.googleapis.com/auth/calendar.events";

    gapi.client.init({
        apiKey: app.apiKey,
        clientId: app.clientId,
        discoveryDocs: app.discoveryDoc,
        scope: app.scopes
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        app.get("#calendar").onclick = handleAuthClick;
        app.get("#logoutgoogle").onclick = handleSignoutClick;
    });
    //sign in
    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
        if (app.calLink == "") {
            let calPage = app.get(".remindShade");
            calPage.style.visibility = "visible";
            calPage.style.opacity = "1";
            calPage.style.filter = "alpha(opacity=100)";
            calPage.style.minHeight = window.innerHeight + "px";
            //預先顯示書名
            app.get("#eventTitle").value = "閱讀" + app.bookTitle;
            app.eventTitle = app.get("#eventTitle").value;
            app.get("#start").value = new Date().toISOString().split("T")[0];
            app.startDate = app.get("#start").value;
            app.get("#end").value = new Date().toISOString().split("T")[0];
            app.endDate = app.get("#end").value;
            app.fillForm();
        } else {
            console.log("按鈕應該已經被隱藏");
        }
    }
    function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
    }
    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            //還要預加讀取 href來判定是否要打開
            console.log("sign in");
        } else {
            console.log("未成功 sign in");
        }
    }
};

app.fillForm = function () {
    //獲取表單資訊
    //1. 事件名稱
    app.get("#eventTitle").onchange = function () {
        console.log(app.get("#eventTitle").value);
        app.eventTitle = app.get("#eventTitle").value;
    };
    //2. 開始日期
    app.get("#start").onchange = function () {
        console.log(app.get("#start").value);
        app.startDate = app.get("#start").value;
    };
    //3. 結束日期
    app.get("#end").onchange = function () {
        console.log(app.get("#end").value);
        app.endDate = app.get("#end").value;
    };
    //每天提醒
    let reminderYes = app.get("#remindYes");
    let reminderNo = app.get("#remindNo");
    //要每天提醒
    reminderYes.onclick = function () {
        app.get(".remind-time").style.display = "block";
        app.get("#setTime").value = "20:00";
        console.log(app.get("#setTime").value);
        app.setTime = app.get("#setTime").value;
        app.get("#setTimeFini").value = "21:00";
        console.log(app.get("#setTimeFini").value);
        app.setTimeFini = app.get("#setTimeFini").value;
        app.get("#remindBefore").value = "10";
        console.log(app.get("#remindBefore").value);
        app.remindMin = app.get("#remindBefore").value;
        //4. 開始閱讀時間
        app.get("#setTime").onchange = function () {
            console.log(app.get("#setTime").value);
            app.setTime = app.get("#setTime").value;
            console.log(app.setTime);
            app.editEvent();
        };
        //5. 結束閱讀時間
        app.get("#setTimeFini").onchange = function () {
            console.log(app.get("#setTimeFini").value);
            app.setTimeFini = app.get("#setTimeFini").value;
            console.log(app.setTimeFini);
            app.editEvent();
        };
        //6. 提醒分鐘數
        app.get("#remindBefore").onchange = function () {
            console.log(app.get("#remindBefore").value);
            app.remindMin = app.get("#remindBefore").value;
            console.log(app.remindMin);
            app.editEvent();
        };
    };
    //不要每天提醒
    reminderNo.onclick = function () {
        console.log("不設定每日提醒");
        app.get(".remind-time").style.display = "none";
        app.get("#addToCalendar").onclick = app.insertEventNoRemind;
    };
};

//如果要每天提醒
app.editEvent = function () {
    //結束日期格式
    let endDateFormat = app.endDate.replace(/-/g, "");
    //from "2018-07-10" to "20180710"
    // 2018-10-20T22:00:00.000+08:00"
    let remindMinInt = parseInt(app.remindMin);

    let event = {
        "summary": app.eventTitle,
        "location": "",
        "description": "查看本書在 Booky 上的狀態 : " + location.href,
        "start": {
            "dateTime": app.startDate + "T" + app.setTime + ":00.000+08:00",
            "timeZone": "Asia/Taipei"
        },
        "end": {
            "dateTime": app.startDate + "T" + app.setTimeFini + ":00.000+08:00",
            "timeZone": "Asia/Taipei"
        },
        "recurrence": [
            "RRULE:FREQ=DAILY;UNTIL=" + endDateFormat
        ],
        "reminders": {
            "useDefault": false,
            "overrides": [
                { "method": "popup", "minutes": remindMinInt }
            ]
        }
    };

    app.insertEvent(event);
};

app.insertEvent = function (event) {
    app.get("#addToCalendar").onclick = function () {
        let request = gapi.client.calendar.events.insert({
            "calendarId": "primary",
            "resource": event
        });
        console.log(event);
        request.execute(function (event) {
            let link = event.htmlLink;
            console.log(event.htmlLink);
            let db = app.database;
            let dbBookList = db.ref("/members/" + app.uid + "/bookList/" + app.bookID + "/calLink");
            console.log(dbBookList);
            dbBookList.set(link, function (error) {
                if (error) {
                    console.log("未將活動連結加進 db");
                } else {
                    console.log("日曆活動建立");
                    alert("日曆活動建立");
                    let calPage = app.get(".remindShade");
                    calPage.style.visibility = "hidden";
                    calPage.style.opacity = "0";
                    calPage.style.filter = "alpha(opacity=0)";
                    calPage.style.minHeight = 0;
                    //隨時監控 google calendar 網址變化
                    let dbCalendar = app.database.ref("/members/" + app.uid + "/bookList/" + app.bookID + "/calLink");
                    dbCalendar.on("value", function (snapshot) {
                        // app.get("#calLink").href = 
                        console.log("要即時加到編輯按鈕上的連結: " + snapshot.val());
                    });
                }
            });
        });
    };

};


//如果不要每天提醒
app.insertEventNoRemind = function () {
    let event = {
        "summary": app.eventTitle,
        "location": "",
        "description": "查看本書在 Booky 上的狀態 : " + location.href,
        "start": {
            "date": app.startDate,
            "timeZone": "Asia/Taipei"
        },
        "end": {
            "date": app.endDate,
            "timeZone": "Asia/Taipei"
        }
    };

    let request = gapi.client.calendar.events.insert({
        "calendarId": "primary",
        "resource": event
    });

    request.execute(function (event) {
        console.log(event.htmlLink);
        let link = event.htmlLink;
        let db = app.database;
        let dbBookList = db.ref("/members/" + app.uid + "/bookList/" + app.bookID + "/calLink");
        dbBookList.set(link, function (error) {
            if (error) {
                console.log("未將活動連結加進 db");
            } else {
                console.log("日曆活動建立");
                alert("日曆活動建立");
                let calPage = app.get(".remindShade");
                calPage.style.visibility = "hidden";
                calPage.style.opacity = "0";
                calPage.style.filter = "alpha(opacity=0)";
                calPage.style.minHeight = 0;
                //隨時監控 google calendar 網址變化
                let dbCalendar = app.database.ref("/members/" + app.uid + "/bookList/" + app.bookID + "/calLink");
                dbCalendar.on("value", function (snapshot) {
                    // app.get("#calLink").href = 
                    console.log("要即時加到編輯按鈕上的連結: " + snapshot.val());
                });
            }
        });

    });
};




window.addEventListener("DOMContentLoaded", app.init);