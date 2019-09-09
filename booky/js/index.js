"use strict";
import app from "./common.js";

app.init = function () {
    app.showLoading();
    app.checkLoginIndex();
    app.googleLogin.getRedirectResult();
};

app.checkLoginIndex = function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            app.uid = user.uid;
            app.email = user.email;
            app.get(".welcome").style.display = "none";
            app.get(".real").style.display = "block";
            let userAgent = navigator.userAgent;
            let isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") < 1;
            if (document.body.clientWidth < 1024) {
                app.visualBookMobile();
            } else if (userAgent.match("Edge") || isSafari) {
                app.visualBookInstead();
            }
            else {
                app.visualBook();
            }
            app.menu();
            app.searchBook.Init();
            app.addBook.Init();
            app.scanBook.Init();
        } else {
            app.get(".welcome").style.display = "block";
            app.get(".real").style.display = "none";
            app.get("#down").addEventListener("click", function () {
                app.get(".feature").scrollIntoView({ block: "start", behavior: "smooth" });
            });
            app.closeLoading();
            app.googleLogin();
        }
    });
};

app.googleLogin = function () {
    app.get("#google").addEventListener("click", function () {
        app.googleLogin.process();
    });
    app.get("#googleTwo").addEventListener("click", function () {
        app.googleLogin.process();
    });
};

app.googleLogin.process = function () {
    app.showLoading();
    if (!firebase.auth().currentUser) {
        let provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope("https://www.googleapis.com/auth/plus.login");
        //啟動 login 程序   
        firebase.auth().signInWithRedirect(provider);
    } else {
        //console.error("sign up or login failed");
    }
};

app.googleLogin.getRedirectResult = function () {
    firebase.auth().getRedirectResult().then(function (result) {
        if (result.user && result.additionalUserInfo.isNewUser) {
            let memberData = {
                uid: result.user.uid,
                name: result.user.displayName,
                email: result.user.email,
                photo: result.user.photoURL
            };
            //send member data to DB
            app.database.ref("/members/" + result.user.uid).set(memberData, function (error) {
                //console.log(error);
            }).then(function (res) {
                // //console.log(res);
            });
        }
    }).catch(function (error) {
        //console.log(error);
    });
};

app.visualBook = function () {
    let slideBG = app.get(".sliding-background");
    let box = app.get(".book-list");
    let num = 0;
    let colorArr = ["#DCB58C", "#EAA140", "#B9B144"];
    app.database.ref("/members/" + app.uid + "/bookList/").once("value").then(snapshot => {
        box.innerHTML = "";
        //if book list is empty
        if (snapshot.val() == null) {
            num = 5;
            let slideNone = slideBG.animate([
                { transform: "translate3d(0, 0, 0)" },
                { transform: "translate3d(-" + (num * 168) + "px, 0, 0)" }
            ], {
                duration: (num * 168 * 1000) / 56,
                iterations: Infinity
            });

            for (let j = 0; j < 2; j++) {
                for (let i = 0; i < num; i++) {
                    let sampleBox = app.createElement("div", "sample-book", "", "", "", box);
                    let sampleHref = app.createElement("a", "spanBox", "", "", "", sampleBox);
                    let sampleText = app.createElement("span", "overlay", "", "", "", sampleHref);
                    app.createElement("span", "", "加入書籍", "", "", sampleText);
                    app.createElement("span", "", "ADD", "", "", sampleText);
                    sampleBox.style.backgroundColor = colorArr[Math.floor(Math.random() * colorArr.length)];
                    sampleBox.onmouseover = function () { slideNone.pause(); };
                    sampleBox.onmouseout = function () { slideNone.play(); };
                }
            }
            app.linkToAddBook();
        } else {
            //如果有 book list
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
            //key visual animation
            let slide = slideBG.animate([
                { transform: "translate3d(0, 0, 0)" },
                { transform: "translate3d(-" + ((listShow.length + num) * 168) + "px, 0, 0)" }
            ], {
                duration: ((listShow.length + num) * 168 * 1000) / 56,
                iterations: Infinity
            });


            app.stopAnimation = function () { slide.pause(); };
            app.startAnimation = function () { slide.play(); };
            //repeat twice to create circle effect
            for (let j = 0; j < 2; j++) {
                for (let i = 0; i < listShow.length; i++) {
                    let bookRead = listShow[i].readStatus == 1 ? "閱讀中" : "未讀";
                    //every book
                    let bookDivHref = app.createElement("a", "", "", "href", "book.html?id=" + listShow[i], box);
                    let bookDiv = app.createElement("div", "book-list-img", "", "", "", bookDivHref);
                    app.createElement("img", "", "", "src", listShow[i].coverURL, bookDiv);
                    if (listShow[i].coverURL == "./img/fakesample1.svg" ||
                        listShow[i].coverURL == "./img/fakesample2.svg" ||
                        listShow[i].coverURL == "./img/fakesample3.svg") {
                        app.createElement("div", "bookTitle", listShow[i].title, "", "", bookDiv);
                    }
                    let bookHref = app.createElement("a", "spanBox", "", "href", "book.html?id=" + listK[i], bookDiv);
                    let bookText = app.createElement("span", "overlay", "", "", "", bookHref);
                    app.createElement("span", "", bookRead, "", "", bookText);
                    app.createElement("span", "", "View", "", "", bookText);
                    bookDiv.onmouseover = function () { app.stopAnimation(); };
                    bookDiv.onmouseout = function () { app.startAnimation(); };
                }
                if (listShow.length < 5) {
                    for (let i = 0; i < num; i++) {
                        let sampleBox = app.createElement("div", "sample-book", "", "", "", box);
                        let sampleHref = app.createElement("a", "spanBox", "", "", "", sampleBox);
                        let sampleText = app.createElement("span", "overlay", "", "", "", sampleHref);
                        app.createElement("span", "", "加入書籍", "", "", sampleText);
                        app.createElement("span", "", "ADD", "", "", sampleText);
                        sampleBox.style.backgroundColor = colorArr[Math.floor(Math.random() * colorArr.length)];
                        sampleBox.onmouseover = function () { app.stopAnimation(); };
                        sampleBox.onmouseout = function () { app.startAnimation(); };
                    }
                    app.linkToAddBook();
                }
            }
        }
    }).catch((error) => {
        //console.log(error);
    });
    app.closeLoading();
};

app.visualBookMobile = function () {
    let keyVisual = app.get(".real .key-visual");
    keyVisual.classList.add("keyVisualMobile");
    keyVisual.style.width = "auto";
    let box = app.get(".book-list");
    box.classList.add("bookListMobile");
    app.database.ref("/members/" + app.uid + "/bookList/").once("value", function (snapshot) {
        box.innerHTML = "";
        if (snapshot.val() == null) {
            let sampleBox = app.createElement("div", "sample-book", "", "", "", box);
            sampleBox.style.backgroundColor = "#EAA140";
            app.linkToAddBook();
        } else {
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
                let bookBox = app.createElement("div", "bookListMobileImg", "", "", "", box);
                let bookHref = app.createElement("a", "bookHref", "", "href", "book.html?id=" + listK[i], bookBox);
                console.log("url", listShow[i].coverURL);

                app.createElement("img", "", "", "src", listShow[i].coverURL, bookHref);
                if (bookListArrV[i].coverURL == "./img/fakesample1.svg" ||
                    bookListArrV[i].coverURL == "./img/fakesample2.svg" ||
                    bookListArrV[i].coverURL == "./img/fakesample3.svg") {
                    if (document.body.clientWidth > 375) {
                        bookHref.style.width = "60%";
                    } else {
                        bookHref.style.width = "45%";
                    }
                    app.createElement("div", "bookTitleMobile", listShow[i].title, "", "", bookHref);
                } else if (bookListArrV[i].coverURL.indexOf("firebasestorage") > -1) {
                    bookHref.style.width = document.body.clientWidth > 375 ? "60%" :
                        "45%";
                }
            }
            window.setTimeout(function () {
                app.get("#pre").style.display = "none";
                app.get("#next").style.display = "block";
                app.visualBookMobile.count = 0;
                app.visualBookMobile.bookLength = listShow.length;

                let eachBook = app.get(".bookListMobileImg").offsetWidth;
                app.visualBookMobile.eachBook = eachBook;
                app.get("#pre").addEventListener("click", function () {
                    box.scrollBy(-eachBook, 0);
                    app.visualBookMobile.count -= eachBook;
                    app.visualBookMobile.arrow();
                });
                app.get("#next").addEventListener("click", function () {
                    box.scrollBy(eachBook, 0);
                    app.visualBookMobile.count += eachBook;
                    app.visualBookMobile.arrow();
                });
            }, 1000);
        }
    }).catch((error) => {
        //console.log(error);
    });
    app.closeLoading();
};

app.visualBookMobile.arrow = function () {
    if (app.visualBookMobile.count < (app.get(".book-list").scrollWidth / app.visualBookMobile.bookLength)) {
        app.get("#pre").style.display = "none";
    } else {
        app.get("#pre").style.display = "block";
    }

    if (app.visualBookMobile.count === (app.get(".book-list").scrollWidth - app.visualBookMobile.eachBook)) {
        app.get("#next").style.display = "none";
    } else {
        app.get("#next").style.display = "block";
    }
};

app.visualBookInstead = function () {
    let keyVisual = app.get(".real .key-visual");
    keyVisual.classList.add("keyVisualMobile");
    keyVisual.style.width = "auto";
    let box = app.get(".book-list");
    box.classList.add("bookListMobile");
    app.database.ref("/members/" + app.uid + "/bookList/").once("value", function (snapshot) {
        box.innerHTML = "";
        if (snapshot.val() == null) {
            for (let i = 0; i < 4; i++) {
                let colorArr = ["#DCB58C", "#EAA140", "#B9B144"];
                let sampleBox = app.createElement("div", "sample-book", "", "", "", box);
                let sampleHref = app.createElement("a", "spanBox", "", "", "", sampleBox);
                let sampleText = app.createElement("span", "overlay", "", "", "", sampleHref);
                app.createElement("span", "", "加入書籍", "", "", sampleText);
                app.createElement("span", "", "ADD", "", "", sampleText);
                sampleBox.style.backgroundColor = colorArr[Math.floor(Math.random() * colorArr.length)];
            }
            app.linkToAddBook();
        } else {
            app.get("#pre").style.display = "none";
            app.get("#next").style.display = "none";

            //如果有 book list
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
            for (let i = 0; i < 4; i++) {
                let bookRead = listShow[i].readStatus == 1 ? "閱讀中" : "未讀";
                //every book
                let bookDivHref = app.createElement("a", "", "", "href", "book.html?id=" + listShow[i], box);
                let bookDiv = app.createElement("div", "book-list-img", "", "", "", bookDivHref);
                app.createElement("img", "", "", "src", listShow[i].coverURL, bookDiv);
                if (listShow[i].coverURL == "./img/fakesample1.svg" ||
                    listShow[i].coverURL == "./img/fakesample2.svg" ||
                    listShow[i].coverURL == "./img/fakesample3.svg") {
                    app.createElement("div", "bookTitle", listShow[i].title, "", "", bookDiv);
                }
                let bookHref = app.createElement("a", "spanBox", "", "href", "book.html?id=" + listK[i], bookDiv);
                let bookText = app.createElement("span", "overlay", "", "", "", bookHref);
                app.createElement("span", "", bookRead, "", "", bookText);
                app.createElement("span", "", "View", "", "", bookText);
                bookDiv.onmouseover = function () { app.stopAnimation(); };
                bookDiv.onmouseout = function () { app.startAnimation(); };
            }
        }
    }).catch((error) => {
        //console.log(error);
    });
    app.closeLoading();
};



app.linkToAddBook = function () {
    let fakeBookAll = app.getAll(".sample-book");
    let addPage = app.get(".add-shade");
    let closeBtn = app.get(".add-img>img");
    for (let i = 0; i < fakeBookAll.length; i++) {
        fakeBookAll[i].addEventListener("click", function () {
            addPage.classList.add("lightbox");
            app.get(".addShade").style.minHeight = window.innerHeight + "px";
        });
        closeBtn.addEventListener("click", function () {
            addPage.classList.remove("lightbox");
            app.get(".container-two")[1].style.display = "none";
        });
    }
};

window.addEventListener("DOMContentLoaded", app.init);

