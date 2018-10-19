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

app.handleClientLoad = function () {
    gapi.load("client:auth2", app.initClient);
};

app.initClient = function () {
    // Client ID and API key from the Developer Console
    app.clientId = "757419169220-9ehr4saki2pbqpp4c2imqa3qd8nbuf0q.apps.googleusercontent.com";
    app.apiKey = "AIzaSyALgpVirl6lyBvOK9W--e5QycFeMFzcPLg";

    // Array of API discovery doc URLs for APIs used by the quickstart
    app.discoveryDoc = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    app.scopes = "https://www.googleapis.com/auth/calendar.events";
    // app.handleClientLoad();
    console.log(app.clientId);
    console.log(app.apiKey);
    console.log(app.discoveryDoc);
    console.log(app.scopes);

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
        app.get("#authorize_button").onclick = handleAuthClick;
        app.get("#signout_button").onclick = handleSignoutClick;
    });

    /**
  *  Sign in the user upon button click.
  */
    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
    }

    app.get("#calendar").onclick = insertEventNoRemind;

    app.get("#start").onchange = function () {
        console.log(app.get("#start").value);
    };

    app.get("#setTime").onchange = function () {
        console.log(app.get("#setTime").value);
    };

    app.get("#setTimeFini").onchange = function () {
        console.log(app.get("#setTimeFini").value);
    };

    //如果不要每天提醒
    function insertEventNoRemind() {
        let event = {
            "summary": "reading with no remind",
            "location": "800 Howard St., San Francisco, CA 94103",
            "description": "A chance to hear more about Google\"s developer products.",
            "start": {
                "date": "2018-10-20",
                "timeZone": "Asia/Taipei"
            },
            "end": {
                "date": "2018-10-23",
                "timeZone": "Asia/Taipei"
            }
        };

        let request = gapi.client.calendar.events.insert({
            "calendarId": "primary",
            "resource": event
        });

        request.execute(function (event) {
            app.get("#calendarLink").textContent = event.htmlLink;
        });
    }

    //如果要每天提醒
    function insertEvent() {
        let event = {
            "summary": "reading",
            "location": "800 Howard St., San Francisco, CA 94103",
            "description": "A chance to hear more about Google\"s developer products.",
            "start": {
                "dateTime": "2018-10-20T21:00:00.000+08:00",
                "timeZone": "Asia/Taipei"
            },
            "end": {
                "dateTime": "2018-10-20T22:00:00.000+08:00",
                "timeZone": "Asia/Taipei"
            },
            "recurrence": [
                "RRULE:FREQ=DAILY;UNTIL=20181025"
            ],
            "reminders": {
                "useDefault": false,
                "overrides": [
                    { "method": "popup", "minutes": 10 }
                ]
            }
        };

        let request = gapi.client.calendar.events.insert({
            "calendarId": "primary",
            "resource": event
        });

        request.execute(function (event) {
            app.get("#calendarLink").textContent = event.htmlLink;
        });
    }

    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            app.get("#authorize_button").style.display = "none";
            app.get("#signout_button").style.display = "block";
        } else {
            app.get("#authorize_button").style.display = "block";
            app.get("#signout_button").style.display = "none";
        }
    }
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


window.addEventListener("DOMContentLoaded", app.init);