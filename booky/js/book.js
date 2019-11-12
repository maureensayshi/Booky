"use strict";
import app from "./common.js";

app.init = function () {
    app.showLoading();
    app.checkLogin().then(uid => {
        app.uid = uid;
        app.bookID = location.search.split("id=")[1];
        app.dbBookList = app.database.ref("/members/" + app.uid + "/bookList/" + app.bookID);
        app.eachBook.getData(app.eachBook.show);
        app.menu();
        app.searchBook.Init();
        app.addBook.Init();
        app.scanBook.Init();
        app.initClient();
    });
};

app.eachBook.getData = function (callback) {
    app.database.ref("/members/" + app.uid + "/bookList/" + app.bookID).once("value", function (snapshot) {
        callback(snapshot.val());
    });
};

app.eachBook.show = function (book) {
    if (book.calLink != "") {
        app.get("#calendar").style.display = "none";
        app.get("#calLink").href = book.calLink;
    } else if (book.calLink == "") {
        app.calLink = book.calLink;
        app.get("#calLink").style.display = "none";
    }
    app.get("main .visual-book>img").src = book.coverURL;
    app.get("#title").textContent = book.title;
    app.bookTitle = book.title;
    app.get("#author").textContent = book.authors.join("、");
    app.get("#publisher").textContent = book.publisher;
    //顯示資料庫原本的資料
    app.get("main .book-place input").value = book.place;
    app.get("main .lend-to input").value = book.lendTo;
    //顯示狀態
    let currentRead = app.get(".current-read");
    let currentTwice = app.get(".current-twice");
    let currentLent = app.get(".current-lent");

    if (book.readStatus == 0) {
        currentRead.textContent = "未讀";
    } else if (book.readStatus == 1) {
        currentRead.textContent = "閱讀中";
    } else if (book.readStatus == 2) {
        currentRead.textContent = "已讀";
    }

    currentTwice.textContent = (book.twice === true) ? "是" : "否";
    currentLent.textContent = (book.lend == true) ? "是" : "否";

    let readChoices = app.getAll("main .reading-status .container input");
    for (let i = 0; i < readChoices.length; i++) {
        if (readChoices[i].value == book.readStatus) {
            readChoices[i].checked = true;
        }
    }
    let twiceChoices = app.getAll("main .twice-or-not .container input");
    for (let i = 0; i < twiceChoices.length; i++) {
        let twiceChoiceDB = twiceChoices[i].value === "true" ? true : false;
        if (twiceChoiceDB == book.twice) {
            twiceChoices[i].checked = true;
        }
    }
    let lendChoices = app.getAll("main .lend-or-not .container input");
    for (let i = 0; i < lendChoices.length; i++) {
        let lendChoiceDB = lendChoices[i].value === "true" ? true : false;
        if (lendChoiceDB == book.lend) {
            lendChoices[i].checked = true;
        }
    }
    app.closeLoading();
    // app.eachBook.uploadCover(book);
    app.eachBook.update(book);
};

// app.eachBook.uploadCover = function (book) {
//     function uploadCover() {
//         let file = app.get("#cover-file").files[0];
//         app.get("main .visual-book>img").src = URL.createObjectURL(file);

//         let uploadTask = app.storage.ref(`${app.uid}/${app.bookID}/`).child("coverURL").put(file);
//         uploadTask.on("state_changed",
//             function (snapshot) {
//                 let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//                 console.log("Upload is " + progress + "% done");
//             }, function (error) {
//                 console.log(error);
//             }, function () {
//                 // Upload completed successfully, now we can get the download URL
//                 uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
//                     console.log("File available at", downloadURL);
//                     book.coverURL = downloadURL;
//                     app.dbBookList.set(book, function (error) {
//                         if (error) {
//                             console.log(error);
//                         } else {
//                             console.log("update with url", book.coverURL);

//                         }
//                     });
//                 });
//             });

//     }
//     app.get("#cover-file").addEventListener("change", uploadCover, false);
// };

app.eachBook.update = function (val) {
    //1.---------------------------------------------------------edit book
    app.eachBook.update.edit(val);
    //2.---------------------------------------------------------delete book
    app.eachBook.update.delete();
};

app.eachBook.update.edit = function (val) {
    let saveBtn = app.get("#save-and-edit");
    saveBtn.addEventListener("click", function () {
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

        if (saveBtn.value === "更新資料") {
            saveBtn.value = "儲存修改";
            saveBtn.style.backgroundImage = "url(img/save.svg)";
            readStatusBox.style.display = "flex";
            currentRead.style.display = "none";
            currentTwice.style.display = "none";
            currentLent.style.display = "none";
            for (let i = 0; i < container.length; i++) { container[i].style.opacity = "1"; }
            for (let i = 0; i < readChoices.length; i++) { readChoices[i].disabled = false; }
            for (let i = 0; i < twiceChoices.length; i++) { twiceChoices[i].disabled = false; }
            for (let i = 0; i < lendChoices.length; i++) { lendChoices[i].disabled = false; }
            placeInput.disabled = false;
            placeInput.className = placeInput.disabled ? "input-init" : "input-edit";
            if (lendChoicesChecked.value == "true") {
                lendToInput.disabled = false;
                lendToInput.className = lendToInput.disabled ? "input-init" : "input-edit";
            }
            lentStatus.addEventListener("click", function () {
                lendToInput.disabled = false;
                lendToInput.className = lendToInput.disabled ? "input-init" : "input-edit";
            });
            lentNo.addEventListener("click", function () {
                lendToInput.disabled = true;
                lendToInput.className = lendToInput.disabled ? "input-init" : "input-edit";
                lendToInput.value = "無";
            });
        } else if (saveBtn.value === "儲存修改") {
            //show confirm alert
            app.get(".editConfirmDiv").style.display = "block";
            if (document.body.clientWidth < 980) {
                app.get(".editConfirmDiv").style.height = document.body.clientHeight + "px";
            }
            app.get(".editConfirm").scrollIntoView({ block: "center", behavior: "smooth" });
            let yesEdit = app.get(".editConfirm>div>button:nth-child(1)");
            let noEdit = app.get(".editConfirm>div>button:nth-child(2)");
            yesEdit.addEventListener("click", function () {
                saveBtn.value = "更新資料";
                saveBtn.style.backgroundImage = "url(img/edit.svg)";
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

                for (let i = 0; i < readChoices.length; i++) { readChoices[i].disabled = true; }
                for (let i = 0; i < twiceChoices.length; i++) { twiceChoices[i].disabled = true; }
                let twiceChoiceSelected = twiceChoicesChecked.value === "true" ? true : false;

                for (let i = 0; i < lendChoices.length; i++) { lendChoices[i].disabled = true; }
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
                currentTwice.textContent = (val.twice == true) ? "是" : "否";
                currentLent.textContent = (val.lend == true) ? "是" : "否";

                //Update info to database
                app.dbBookList.set(val, function (error) {
                    if (error) {
                        //console.log(error);
                    } else {
                        app.get(".editConfirmDiv").style.display = "none";
                        app.get(".afterEditDiv").style.display = "block";
                        app.get(".afterEditDiv").scrollIntoView({ block: "center", behavior: "smooth" });
                        setTimeout(function () {
                            app.get(".afterEditDiv").style.display = "none";
                        }, 1500);
                    }
                });
            });
            //dont save edit info
            noEdit.addEventListener("click", function () {
                app.get(".editConfirmDiv").style.display = "none";
            });
        }
    });
};

app.eachBook.update.delete = function () {
    let deleteBtn = app.get("#delete");
    deleteBtn.addEventListener("click", function () {
        app.get(".deleteDiv").style.display = "block";
        if (document.body.clientWidth < 980) {
            app.get(".deleteDiv").style.height = document.body.clientHeight + "px";
        }
        app.get(".deleteConfirm").scrollIntoView({ block: "center", behavior: "smooth" });
        let yesSave = app.get(".deleteConfirm>div>button:nth-child(1)");
        let noSave = app.get(".deleteConfirm>div>button:nth-child(2)");
        yesSave.addEventListener("click", function () {
            //set to database
            app.dbBookList.remove(function (error) {
                if (error) {
                    //console.log(error);
                } else {
                    app.get(".deleteDiv").style.display = "none";
                    app.get(".afterDeleteDiv").style.display = "block";
                    if (document.body.clientWidth < 980) {
                        app.get(".afterDeleteDiv").style.height = document.body.clientHeight + "px";
                    }
                    app.get(".afterDelete").scrollIntoView({ block: "center", behavior: "smooth" });
                    setTimeout(function () {
                        window.location = "bookshelf.html?status=all";
                    }, 1000);
                }
            });
        });
        noSave.addEventListener("click", function () {
            app.get(".deleteDiv").style.display = "none";
        });
        app.get(".deleteDiv").addEventListener("click", function (e) {
            if (e.target === app.get(".deleteDiv")) {
                app.get(".deleteDiv").style.display = "none";
            }
        });
    });
};

app.initClient = function () {
    app.get("#calendar").onclick = handleAuthClick;
    app.get("#logoutgoogle").onclick = handleSignoutClick;
    //sign in
    function handleAuthClick() {
        gapi.auth2.getAuthInstance().signIn();
        if (app.calLink == "") {
            let calPage = app.get(".remindShade");
            calPage.classList.add("lightbox");
            calPage.style.minHeight = window.innerHeight + "px";
            //預先顯示書名
            app.get("#eventTitle").value = "閱讀" + app.bookTitle;
            app.eventTitle = app.get("#eventTitle").value;
            app.get("#start").value = new Date().toISOString().split("T")[0];
            app.startDate = app.get("#start").value;
            app.get("#end").value = new Date().toISOString().split("T")[0];
            app.endDate = app.get("#end").value;
            app.getAll("main .remind-or-not .container")[0].style.opacity = "1";
            app.getAll("main .remind-or-not .container")[1].style.opacity = "1";
            app.eachBook.googleCal.fillForm();
            let cancel = app.get(".remind-img>img");
            cancel.addEventListener("click", function () {
                calPage.classList.remove("lightbox");
                calPage.style.minHeight = 0;
            });
        } else {
            //console.log("按鈕應該已經被隱藏");
        }
    }
    //SIGN OUT
    function handleSignoutClick() {
        gapi.auth2.getAuthInstance().signOut();
    }
    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            //console.log("sign in");
        } else {
            //console.log("didn"t sign in");
        }
    }
};

app.eachBook.googleCal.fillForm = function () {
    //form info
    app.get("#eventTitle").onchange = function () {
        app.eventTitle = app.get("#eventTitle").value;
    };
    app.get("#start").onchange = function () {
        app.startDate = app.get("#start").value;
    };
    app.get("#end").onchange = function () {
        app.endDate = app.get("#end").value;
    };
    let reminderYes = app.get("#remindYes");
    let reminderNo = app.get("#remindNo");
    //daily remind
    reminderYes.addEventListener("click", function () {
        app.get(".remind-time").style.display = "block";
        app.get("#setTime").value = "20:00";
        app.setTime = app.get("#setTime").value;
        app.get("#setTimeFini").value = "21:00";
        app.setTimeFini = app.get("#setTimeFini").value;
        app.get("#remindBefore").value = "10";
        app.remindMin = app.get("#remindBefore").value;
        app.get("#setTime").onchange = function () {
            app.setTime = app.get("#setTime").value;
            app.eachBook.googleCal.edit();
        };
        app.get("#setTimeFini").onchange = function () {
            app.setTimeFini = app.get("#setTimeFini").value;
            app.eachBook.googleCal.edit();
        };
        app.get("#remindBefore").onchange = function () {
            app.remindMin = app.get("#remindBefore").value;
            app.eachBook.googleCal.edit();
        };
        app.eachBook.googleCal.edit();
    });
    //no daily remind
    reminderNo.addEventListener("click", function () {
        app.get(".remind-time").style.display = "none";
        app.get("#addToCalendar").addEventListener("click", function () {
            let startStr = app.get("#start").value.replace(/-/g, "");
            let endStr = app.get("#end").value.replace(/-/g, "");
            if (endStr < startStr) {
                alert("結束日期不得早於開始日期");
            } else {
                app.eachBook.googleCal.insertEventNoRemind();
            }
        });
    });
};

//prepare daily remind data for google calendar API
app.eachBook.googleCal.edit = function () {
    let endDateFormat = app.endDate.replace(/-/g, "");
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
    app.eachBook.googleCal.insertEvent(event);
};

app.eachBook.googleCal.insertEvent = function (event) {
    app.get("#addToCalendar").addEventListener("click", function () {
        let startStr = app.get("#start").value.replace(/-/g, "");
        let endStr = app.get("#end").value.replace(/-/g, "");
        let setStr = app.get("#setTime").value.replace(/:/g, "");
        let setFiniStr = app.get("#setTimeFini").value.replace(/:/g, "");
        if (endStr < startStr && setFiniStr < setStr) {
            alert("結束日期不得早於開始日期 & 結束閱讀時間不得早於開始閱讀時間");
        } else if (endStr < startStr && setFiniStr > setStr) {
            alert("結束日期不得早於開始日期");
        } else if (endStr > startStr && setFiniStr < setStr) {
            alert("結束閱讀時間不得早於開始閱讀時間");
        } else {
            let request = gapi.client.calendar.events.insert({
                "calendarId": "primary",
                "resource": event
            });
            request.execute(function (event) {
                let link = event.htmlLink;
                let db = app.database;
                let dbBookList = db.ref("/members/" + app.uid + "/bookList/" + app.bookID + "/calLink");
                //console.log(dbBookList);
                dbBookList.set(link, function (error) {
                    if (error) {
                        //console.log("未將活動連結加進 db");
                    } else {
                        app.eachBook.googleCal.afterSend(link);
                    }
                });
            });
        }
    });
};

//prepare and send no daily remind data for google calendar API
app.eachBook.googleCal.insertEventNoRemind = function () {
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
        let link = event.htmlLink;
        let dbBookList = app.database.ref("/members/" + app.uid + "/bookList/" + app.bookID + "/calLink");
        dbBookList.set(link, function (error) {
            if (error) {
                //console.log("未將活動連結加進 db");
            } else {
                app.eachBook.googleCal.afterSend(link);
            }
        });
    });
};

//alert after insert event to google calendar
app.eachBook.googleCal.afterSend = function (link) {
    let calPage = app.get(".remindShade");
    calPage.classList.remove("lightbox");
    calPage.style.minHeight = 0;
    //show up alert
    app.get(".gLinkDiv").style.display = "block";
    if (document.body.clientWidth < 980) {
        app.get(".gLinkDiv").style.height = document.body.clientHeight + "px";
    }

    app.get(".gLink").scrollIntoView({ block: "center", behavior: "smooth" });

    let back = app.get(".gLink>div>button:nth-child(1)");
    let toLink = app.get(".gLink>div>button:nth-child(2)");
    let gLinkDiv = app.get(".gLinkDiv");

    back.addEventListener("click", function () {
        app.get(".gLinkDiv").style.display = "none";
        app.eachBook.googleCal.addLinkOnBtn();
    });

    toLink.addEventListener("click", function () {
        window.location = link;
    });

    gLinkDiv.addEventListener("click", function (e) {
        if (e.target === gLinkDiv) {
            gLinkDiv.style.display = "none";
            app.eachBook.googleCal.addLinkOnBtn();
        }
    });
};

app.eachBook.googleCal.addLinkOnBtn = function () {
    let dbCalendar = app.database.ref("/members/" + app.uid + "/bookList/" + app.bookID + "/calLink");
    dbCalendar.on("value", function (snapshot) {
        app.get("#calendar").style.display = "none";
        app.get("#calLink").href = snapshot.val();
        app.get("#calLink").style.display = "inline-block";
    });
};

window.addEventListener("DOMContentLoaded", app.init);