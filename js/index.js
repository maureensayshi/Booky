"use strict";

app.init = function () {
    app.showLoading();
    app.checkingIndex();
    app.getRedirectResult();
    console.log(window.innerHeight);

};

app.checkingIndex = function () {
    firebase.auth().onAuthStateChanged(function (user) {
        console.log("in app.checklogin .......");
        if (user) {
            // User is signed in.
            app.uid = user.uid;
            console.log(app.uid);
            // app.get(".welcome").style.display = "none";
            app.get(".real").style.display = "block";
            if (document.body.clientWidth > 1024) {
                app.visualBook();
            } else {
                app.visualBookMobile();
            }
            app.menu();
            app.searchBar();
            app.addBookInit();
            app.scanBookInit();
            app.closeLoading();
        } else {
            // User is signed out or haven't sign up.
            // app.get(".welcome").style.display = "block";
            app.get(".real").style.display = "none";
            app.closeLoading();
            app.googleLogin();
        }
    });
};

app.googleLogin = function () {
    let gButton = app.get("#google");
    gButton.addEventListener("click", function () {
        app.showLoading();
        if (!firebase.auth().currentUser) {
            let provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope("https://www.googleapis.com/auth/plus.login");
            //啟動 login 程序   
            firebase.auth().signInWithRedirect(provider);
        } else {
            console.error("sign up or login failed");
        }
    });
};

app.getRedirectResult = function () {
    firebase.auth().getRedirectResult().then(function (result) {
        console.log(result);
        app.closeLoading();

        if (result.user && result.additionalUserInfo.isNewUser) {
            let uid = result.user.uid;
            let name = result.user.displayName;
            let email = result.user.email;
            let photo = result.user.photoURL;
            //prepare member data for DB
            let memberData = {
                uid: uid,
                name: name,
                email: email,
                photo: photo,
                bookList: ""
            };
            //send member data to DB
            let db = app.database;
            db.ref("/members/" + uid).set(memberData, function (error) {
                if (error) {
                    console.log("Error of setting member data.");
                } else {
                    console.log("Set member data okay.");
                }
            }).then(function (res) {
                console.log(res);
            });
        }
    }).catch(function (error) {
        console.log(error);
    });
};

app.visualBook = function () {
    let slideBG = app.get(".sliding-background");
    let box = app.get(".book-list");
    let num = 0;
    let colorArr = ["#DCB58C", "#EAA140", "#B9B144"];
    let db = app.database;
    let dbBookList = db.ref("/members/" + app.uid + "/bookList/");
    dbBookList.once("value", function (snapshot) {
        //如果沒有 book list
        if (snapshot.val() == null) {
            console.log("no");
            num = 5;
            let slideNone = slideBG.animate([
                // keyframes
                { transform: "translate3d(0, 0, 0)" },
                { transform: "translate3d(-" + (num * 168) + "px, 0, 0)" }
            ], {
                    duration: (num * 168 * 1000) / 56,
                    iterations: Infinity
                });

            for (let j = 0; j < 2; j++) {
                for (let i = 0; i < num; i++) {
                    let sampleBoxHref = app.createElement("a", "", "", "href", "", box);
                    let sampleBox = app.createElement("div", "sample-book", "", "", "", sampleBoxHref);
                    let sampleHref = app.createElement("a", "spanBox", "", "", "", sampleBox);
                    let sampleText = app.createElement("span", "overlay", "", "", "", sampleHref);
                    let sampleTitle = app.createElement("span", "", "加入書籍", "", "", sampleText);
                    let sampleAdd = app.createElement("span", "", "ADD", "", "", sampleText);
                    sampleBox.style.backgroundColor = colorArr[Math.floor(Math.random() * colorArr.length)];
                    sampleBox.onmouseover = function () { slideNone.pause(); };
                    sampleBox.onmouseout = function () { slideNone.play(); };
                }
            }
        } else {
            //如果有 book list
            console.log(snapshot.val());
            let bookListArrV = Object.values(snapshot.val());
            let bookListArrK = Object.keys(snapshot.val());

            let listRead = [];
            let listShow = [];
            let listK = [];
            for (let i = 0; i < bookListArrV.length; i++) {
                if (bookListArrV[i].readStatus == 2) {
                    listRead.push(bookListArrV[i]);
                    num = 5;
                } else if (bookListArrV[i].readStatus != 2) {
                    listShow.push(bookListArrV[i]);
                    listK.push(bookListArrK[i]);
                    num = listShow.length < 5 ? 5 - listShow.length : 0;
                }
            }
            console.log(listShow);

            //key visual animation
            let slide = slideBG.animate([
                // keyframes
                { transform: "translate3d(0, 0, 0)" },
                { transform: "translate3d(-" + ((listShow.length + num) * 168) + "px, 0, 0)" }
            ], {
                    // timing options
                    duration: ((listShow.length + num) * 168 * 1000) / 56,
                    iterations: Infinity
                });

            app.stopAnimation = function () { slide.pause(); };
            app.startAnimation = function () { slide.play(); };
            //show book list from db
            //repeat twice
            for (let j = 0; j < 2; j++) {
                for (let i = 0; i < listShow.length; i++) {
                    let bookRead = listShow[i].readStatus == 1 ? "閱讀中" : "未讀";
                    //every book
                    let bookDivHref = app.createElement("a", "", "", "href", "/book.html?id=" + listShow[i], box);
                    let bookDiv = app.createElement("div", "book-list-img", "", "", "", bookDivHref);
                    let bookImg = app.createElement("img", "", "", "src", listShow[i].coverURL, bookDiv);
                    if (listShow[i].coverURL == "../img/fakesample1.svg" ||
                        listShow[i].coverURL == "../img/fakesample2.svg" ||
                        listShow[i].coverURL == "../img/fakesample3.svg") {
                        let bookTitle = app.createElement("div", "bookTitle", listShow[i].title, "", "", bookDiv);
                    }
                    let bookHref = app.createElement("a", "spanBox", "", "href", "/book.html?id=" + listK[i], bookDiv);
                    let bookText = app.createElement("span", "overlay", "", "", "", bookHref);
                    let bookReadText = app.createElement("span", "", bookRead, "", "", bookText);
                    let bookClick = app.createElement("span", "", "View", "", "", bookText);
                    bookDiv.onmouseover = function () { app.stopAnimation(); };
                    bookDiv.onmouseout = function () { app.startAnimation(); };
                }
                if (listShow.length < 5) {
                    for (let i = 0; i < num; i++) {
                        let sampleBoxHref = app.createElement("a", "", "", "href", "", box);
                        let sampleBox = app.createElement("div", "sample-book", "", "", "", sampleBoxHref);
                        let sampleHref = app.createElement("a", "spanBox", "", "", "", sampleBox);
                        let sampleText = app.createElement("span", "overlay", "", "", "", sampleHref);
                        let sampleTitle = app.createElement("span", "", "加入書籍", "", "", sampleText);
                        let sampleAdd = app.createElement("span", "", "ADD", "", "", sampleText);
                        sampleBox.style.backgroundColor = colorArr[Math.floor(Math.random() * colorArr.length)];
                        sampleBox.onmouseover = function () { app.stopAnimation(); };
                        sampleBox.onmouseout = function () { app.startAnimation(); };
                    }
                }
            }
        }
    }).catch((error) => {
        console.log(error);
    });
};

app.visualBookMobile = function () {
    let keyVisual = app.get(".key-visual");
    keyVisual.classList.add("keyVisualMobile");
    keyVisual.classList.remove("key-visual");

    let box = app.get(".book-list");
    box.classList.add("bookListMobile");
    box.classList.remove("book-list");

    let db = app.database;
    let dbBookList = db.ref("/members/" + app.uid + "/bookList/");
    dbBookList.once("value", function (snapshot) {
        if (snapshot.val() == null) {
            console.log("no book");
            let sampleBoxHref = app.createElement("a", "", "", "href", "", box);
            let sampleBox = app.createElement("div", "sample-book", "", "", "", sampleBoxHref);
            sampleBox.style.backgroundColor = "#EAA140";
        } else {
            // console.log(snapshot.val());
            let bookListArrV = Object.values(snapshot.val());
            let bookListArrK = Object.keys(snapshot.val());

            let listRead = [];
            let listShow = [];
            let listK = [];
            for (let i = 0; i < bookListArrV.length; i++) {
                if (bookListArrV[i].readStatus == 2) {
                    listRead.push(bookListArrV[i]);
                } else if (bookListArrV[i].readStatus != 2) {
                    listShow.push(bookListArrV[i]);
                    listK.push(bookListArrK[i]);
                }
            }

            for (let i = 0; i < listShow.length; i++) {
                let bookBox = app.createElement("div", "bookListMobileImg", "", "", "", box)
                let bookHref = app.createElement("a", "bookHref", "", "href", "/book.html?id=" + listK[i], bookBox);
                let bookDiv = app.createElement("img", "", "", "src", listShow[i].coverURL, bookHref);
                if (bookListArrV[i].coverURL == "../img/fakesample1.svg" ||
                    bookListArrV[i].coverURL == "../img/fakesample2.svg" ||
                    bookListArrV[i].coverURL == "../img/fakesample3.svg") {
                    if (document.body.clientWidth > 640) {
                        bookHref.style.width = "60%";
                    } else {
                        bookHref.style.width = "35%";
                    }
                    let bookTitle = app.createElement("div", "bookTitleMobile", listShow[i].title, "", "", bookHref);
                }
            }

            app.get("#pre").style.display = "block";
            app.get("#next").style.display = "block";

            let eachBook = app.get(".bookHref").clientWidth;
            app.get("#pre").onclick = function () {
                box.scrollBy(-375, 0);
                console.log("pre");
                console.log(eachBook);
            };
            app.get("#next").onclick = function () {
                box.scrollBy(375, 0);
                console.log("next");
                console.log(eachBook);
            };
        }
    }).catch((error) => {
        console.log(error);
    });
};

window.addEventListener("DOMContentLoaded", app.init);


