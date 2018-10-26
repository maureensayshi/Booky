"use strict";
// initialize firebase
let config = {
    apiKey: "AIzaSyALgpVirl6lyBvOK9W--e5QycFeMFzcPLg",
    authDomain: "booky-217508.firebaseapp.com",
    databaseURL: "https://booky-217508.firebaseio.com",
    projectId: "booky-217508",
    storageBucket: "booky-217508.appspot.com",
    messagingSenderId: "757419169220",
    scopes: [
        "email",
        "profile"
    ]
};

firebase.initializeApp(config);
// initialize app structure
let app = {
    database: firebase.database(),
    apiKey: "AIzaSyALgpVirl6lyBvOK9W--e5QycFeMFzcPLg",
    eachBook: { googleCal: {}, },
    googleBooks: {},
    addBook: {},
    scanBook: {},
    member: {},
};

app.checkLogin = function () {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(function (user) {
            console.log("in app.checklogin .......");
            if (user) {
                resolve(user.uid);
                console.log(user.uid);
            } else {
                // User is signed out or haven"t sign up.
                reject(window.location = "/");
            }
        });
    });
};

// for selecting HTML DOM
app.get = function (selector) {
    return document.querySelector(selector);
};
app.getAll = function (selector) {
    return document.querySelectorAll(selector);
};
// for creating HTML Element
app.createElement = function (tagName, class_Name, text_Content, attr, attrText, parentElement) {
    let obj = document.createElement(tagName);
    obj.className = class_Name;
    obj.textContent = text_Content;
    obj[attr] = attrText;
    if (parentElement instanceof Element) { parentElement.appendChild(obj); }
    return obj;
};

// menu open and close
app.menu = function () {
    let menuBtn = app.get(".btn_menu");
    let menu = app.get(".menu");
    let closeBtn = app.get(".close-menu");
    let shadow = app.get(".menu-shade");
    menu.style.display = (window.innerWidth < 1025) ? "none" : "flex";
    menuBtn.addEventListener("click", function () {
        menu.style.left = "0";
        menu.style.opacity = "1";
        menu.style.display = "flex";
        menuBtn.style.visibility = (window.innerWidth < 1025) ? "visible" : "hidden";
        shadow.style.left = "0%";
    });
    closeBtn.addEventListener("click", function () {
        if (window.innerWidth >= 1025) { menu.style.left = "-350px"; }
        else if (window.innerWidth < 1025) { menu.style.display = "none"; }
        menuBtn.style.visibility = "visible";
        shadow.style.left = "-100%";
    });
};

//search bar
app.searchBar = function () {
    let searchBtn = app.get(".btn_search");
    let searchPage = app.get(".search-shade");
    let closeBtn = app.get(".searchbar-img>img");
    let searchText = app.get(".searchbar-form>input");
    searchBtn.addEventListener("click", function () {
        searchPage.classList.add("lightbox");
        app.get(".searchShade").style.minHeight = window.innerHeight + "px";
    });
    closeBtn.addEventListener("click", function () {
        searchPage.classList.remove("lightbox");
        app.getAll(".container-two")[0].classList.remove("show-container");
        searchText.value = "";
    });
    app.searchBar.getInput();
};

//get keyword by user key-in
app.searchBar.getInput = function () {
    let formSearchBar = app.get(".searchbar-form");
    formSearchBar.onsubmit = function () {
        app.searchBar.input = app.get(".searchbar-form>input").value;
        app.searchBar.getResult();
        app.getAll(".result")[0].innerHTML = "";
        return false;
    };
};

//search keyword in booky database
app.searchBar.getResult = function () {
    app.bookMatch = [];
    if (app.searchBar.input) {
        app.database.ref("/members/" + app.uid + "/bookList/").once("value", function (snapshot) {
            let bookListArrK = Object.keys(snapshot.val());
            let bookListArrV = Object.values(snapshot.val());
            let mixedStr = "";
            for (let i = 0; i < bookListArrV.length; i++) {
                let author = bookListArrV[i].authors.toString();
                mixedStr = bookListArrV[i].title + bookListArrV[i].publisher + bookListArrV[i].isbn + author;
                if (mixedStr.toLowerCase().indexOf(app.searchBar.input.toLowerCase()) != -1) {
                    app.bookMatch.push(bookListArrK[i]);
                    let bookTitle = bookListArrV[i].title;
                    let bookAuthor = bookListArrV[i].authors.join("、");
                    let bookPublisher = bookListArrV[i].publisher;
                    let bookISBN = bookListArrV[i].isbn;
                    let bookCover = bookListArrV[i].coverURL;
                    let href = "book.html?id=" + bookListArrK[i];
                    let amount = app.bookMatch.length;
                    app.containerNum = 0;
                    app.googleBooks.show(bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover, amount, href);
                }
            }
            if (app.bookMatch.length === 0) {
                app.getAll(".container-two")[0].classList.add("show-container");
                app.getAll(".container-two")[0].scrollIntoView({ block: "start", behavior: "smooth" });
                app.getAll(".container-two h2>span")[0].textContent = 0;
                app.getAll(".result")[0].textContent = "您沒有相關書籍在 Booky";
                app.getAll(".result")[0].style.justifyContent = "center";

            }
        });
    }
};

// add book --------------------------------------------------------------------------------------
app.addBook.Init = function () {
    let addBtn = app.get("#addbook");
    let addPage = app.get(".add-shade");
    let closeBtn = app.get(".add-img>img");
    addBtn.addEventListener("click", function () {
        addPage.classList.add("lightbox");
        app.get(".addShade").style.minHeight = window.innerHeight + "px";
        app.addBook.typeListener();
        app.addBook.getInput();
    });

    closeBtn.addEventListener("click", function (e) {
        addPage.classList.remove("lightbox");
        app.getAll(".container-two")[1].classList.remove("show-container");
        app.get("#keyword").value = "";
    });
};

//sort type init
app.addBook.typeListener = function () {
    let threeType = app.getAll(".addtab");
    app.searchText = app.get(".active").value;
    for (let i = 0; i < threeType.length; i++) {
        threeType[i].addEventListener("click", app.addBook.typeSelected);
    }
};

app.addBook.typeSelected = function (e) {
    let threeType = app.getAll(".addtab");
    for (let i = 0; i < threeType.length; i++) { threeType[i].classList.remove("active"); }
    e.currentTarget.classList.add("active");
    app.searchText = e.target.value;
};

app.addBook.getInput = function () {
    //press enter
    let formSearch = app.get("#searchForm");
    formSearch.onsubmit = function () {
        app.getAll(".container-two h2>span")[1].textContent = "";
        app.getAll(".result")[1].style.justifyContent = "flex-start";
        app.getAll(".result")[1].innerHTML = "";
        app.addBook.input();
        return false;
    };
    // get keyin word
    app.addBook.input = function () {
        let keyWord = app.get("#keyword").value;
        if (keyWord) {
            app.addBook.search(keyWord);
        } else {
            //user didn't enter keyword
            app.getAll(".container-two")[1].classList.remove("show-container");
        }
    };
};

app.addBook.search = function (keyWord) {
    app.containerNum = 1;
    switch (app.searchText) {
    case "search-title":
        app.googleBooks.fetch("intitle", keyWord).then(function (data) {
            app.googleBooks.getData(data);
        }).catch(function (error) {
            app.googleBooks.errorHandler(error);
        });
        break;
    case "search-isbn":
        app.googleBooks.fetch("isbn", keyWord).then(function (data) {
            app.googleBooks.getData(data);
        }).catch(function (error) {
            app.googleBooks.errorHandler(error);
        });
        break;
    case "search-author":
        app.googleBooks.fetch("inauthor", keyWord).then(function (data) {
            app.googleBooks.getData(data);
        }).catch(function (error) {
            app.googleBooks.errorHandler(error);
        });
        break;
    }
};

// scan book --------------------------------------------------------------------------------------
app.scanBook.Init = function () {
    let scanBtn = app.get("#scanbook");
    let scanPage = app.get(".scan-shade");
    let closeBtn = app.get(".scan-img>img");
    scanBtn.addEventListener("click", function () {
        scanPage.classList.add("lightbox");
        app.get(".scanShade").style.minHeight = window.innerHeight + "px";
        if (document.body.clientWidth > 1024) {
            app.get(".scan-list").style.display = "block";
            app.scanBook.scan();
        } else {
            app.get(".shot-list").style.display = "block";
            app.scanBook.imgScan();
        }
    });
    closeBtn.addEventListener("click", function () {
        scanPage.classList.remove("lightbox");
        app.getAll(".container-two")[app.containerNum].classList.remove("show-container");
        if (app.get(".line")) { app.get(".line").textContent = ""; }
        if (app.get(".imgLoad")) { app.get(".imgLoad").textContent = ""; }
        codeReader.reset();
    });
};

const codeReader = new ZXing.BrowserBarcodeReader();
console.log("ZXing code reader initialized");
// scan book ( Desktop ) --------------------------------------------------------------------------------------
app.scanBook.scan = function () {
    let startBtn = app.get("#startButton");
    codeReader.getVideoInputDevices()
        .then((videoInputDevices) => {
            const sourceSelect = document.getElementById("sourceSelect");
            const firstDeviceId = videoInputDevices[0].deviceId;
            if (videoInputDevices.length > 1) {
                videoInputDevices.forEach((element) => {
                    const sourceOption = document.createElement("option");
                    sourceOption.text = element.label;
                    sourceOption.value = element.deviceId;
                    sourceSelect.appendChild(sourceOption);
                });
            }
            startBtn.addEventListener("click", () => {
                app.containerNum = 2;
                let line = app.get(".line");
                app.getAll(".container-two")[2].classList.remove("show-container");
                // app.getAll(".container-two")[2].style.display = "none";
                // app.getAll(".container-two h2>span")[2].textContent = "";
                app.getAll(".result")[2].textContent = "";
                app.getAll(".result")[2].style.justifyContent = "flex-start";
                if (startBtn.value == "start") {
                    if (startBtn.textContent === "重新掃描") {
                        console.log("重新掃描: " + startBtn.value);
                    } else {
                        startBtn.value = "stop";
                    }
                    startBtn.textContent = "停止掃描";
                    line.textContent = "SEARCHING......";
                    line.classList.add("typewriter");
                    codeReader.decodeFromInputVideoDevice(undefined, "video").then((result) => {
                        if (result) {
                            line.textContent = "ISBN : " + result.text;
                            line.classList.remove("typewriter");
                            startBtn.textContent = "重新掃描";
                            app.getAll(".container-two")[2].style.display = "block";
                            app.getAll(".container-two h2>span")[2].textContent = "";
                            app.getAll(".result")[2].textContent = "";
                            app.getAll(".result")[2].style.justifyContent = "center";
                            app.googleBooks.fetch("isbn", result.text).then(function (data) {
                                app.googleBooks.getData(data);
                            }).catch(function (error) {
                                app.googleBooks.errorHandler(error);
                            });
                        }
                    }).catch((err) => {
                        console.error(err);
                        line.textContent = "查無此書";
                        line.classList.remove("typewriter");
                        startBtn.textContent = "重新掃描";
                    });
                    // startBtn.value = "stop";
                    console.log("startBtn.value" + startBtn.value);

                    console.log(`Started continous decode from camera with id ${firstDeviceId}`);
                } else if (startBtn.value == "stop") {
                    startBtn.value = "start";
                    //waiting test
                    codeReader.reset();
                    startBtn.textContent = "打開相機";
                    line.textContent = "";
                    line.classList.remove("typewriter");
                    //remove title
                    app.getAll(".container-two")[2].classList.remove("show-container");
                    console.log("startBtn.value" + startBtn.value);
                }
            });
        })
        .catch((err) => {
            console.error(err);
        });
};

// add book ( mobile )--------------------------------------------------------------------------------------
app.scanBook.imgScan = function () {
    app.containerNum = 3;
    function ProcessFile(e) {
        let file = document.getElementById("file").files[0];
        app.get("#img-result>img").src = URL.createObjectURL(file);
        app.getAll(".result")[3].textContent = "";
    }
    document.getElementById("file").addEventListener("change",
        ProcessFile, false);
    app.get("#img-result>img").onload = function () {
        app.scanBook.imgScan.decodeFun();
    };
};

//拍照後搜尋資料庫
app.scanBook.imgScan.decodeFun = function (ev) {
    const codeReader = new ZXing.BrowserBarcodeReader("video");
    let fileImg = app.get("#img-result>img");
    let uploadBtn = app.get(".shot-list label");
    codeReader.decodeFromImage(fileImg).then((result) => {
        app.containerNum = 3;
        app.get(".imgLoad").textContent = "ISBN : " + result.text;
        app.getAll(".container-two")[3].classList.add("show-container");
        app.getAll(".container-two h2>span")[3].textContent = "";
        app.getAll(".container-two h2>span")[3].textContent = "";
        app.googleBooks.fetch("isbn", result.text).then(function (data) {
            app.googleBooks.getData(data);
        }).catch(function (error) {
            app.googleBooks.errorHandler(error);
        });
        uploadBtn.textContent = "重新拍攝";
    }).catch((err) => {
        app.containerNum = 3;
        app.get(".imgLoad").textContent = "未偵測到條碼";
        app.getAll(".container-two")[3].classList.add("show-container");
        app.getAll(".container-two h2>span")[3].textContent = "0";
        app.getAll(".result")[3].textContent = "無搜尋結果，請重新拍攝";
        uploadBtn.textContent = "重新拍攝";
    });
    console.log(`Started decode for image from ${fileImg.src}`);
};

app.googleBooks.fetch = function (searchType, keyword) {
    return new Promise(function (resolve, reject) {
        fetch("https://www.googleapis.com/books/v1/volumes?q=" + searchType + ":" + keyword + "&maxResults=40&key=" + app.apiKey)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                if (data.items) {
                    resolve(data);
                } else {
                    reject(data);
                }
            })
            .catch(function (error) {
                reject(error);
            });
    });
};

app.googleBooks.errorHandler = function (error) {
    let i = app.containerNum;
    app.getAll(".container-two")[i].classList.add("show-container");
    app.getAll(".container-two")[i].scrollIntoView({ block: "start", behavior: "smooth" });
    app.getAll(".result")[i].textContent = "請用其他關鍵字搜尋";
    app.getAll(".result")[i].style.justifyContent = "center";
    app.getAll(".container-two h2>span")[i].textContent = 0;
    console.log(error);
};

app.googleBooks.getData = function (data) {
    let amount = 0;
    for (let i = 0; i < data.items.length; i++) {
        amount = data.items.length;
        let bookTitle = data.items[i].volumeInfo.title;
        let authors = data.items[i].volumeInfo.authors;
        let bookAuthor = (authors != null) ? authors.join("、") : "暫無資料";
        let publisher = data.items[i].volumeInfo.publisher;
        let bookPublisher = (publisher != null) ? publisher : "暫無資料";
        let isbn = data.items[i].volumeInfo.industryIdentifiers;
        let bookISBN;
        if (isbn != null) {
            let tmpISBN;
            for (let i = 0; i < isbn.length; i++) {
                if (isbn[i].type == "ISBN_13")
                    tmpISBN = isbn[i].identifier;
            }
            bookISBN = (tmpISBN) ? tmpISBN : "暫無資料";
        } else if (isbn == null) { bookISBN = "暫無資料"; }
        let fakeCovers = ["./img/fakesample1.svg", "./img/fakesample2.svg", "./img/fakesample3.svg"];
        let fakeCover = fakeCovers[Math.floor(Math.random() * fakeCovers.length)];
        let cover = data.items[i].volumeInfo.imageLinks;
        let bookCover = (cover != null) ? cover.thumbnail : fakeCover;
        app.googleBooks.show(bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover, amount, "");
    }
};

app.googleBooks.show = function (bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover, amount, href) {
    let i = app.containerNum;
    console.log(app.containerNum);

    app.getAll(".container-two")[i].classList.add("show-container");
    app.getAll(".container-two")[i].style.paddingBottom = "500px";
    app.getAll(".container-two")[i].scrollIntoView({ block: "start", behavior: "smooth" });
    if (app.get("#startButton")) {
        codeReader.reset();
        app.get("#startButton").textContent = "重新掃描";
        // app.get("#startButton").value = "stop";
        console.log("show value" + app.get("#startButton").value);
        console.log("only stop here, didnt go to start stop again");
    }
    if (i == 2) { amount = 1; }
    app.getAll(".container-two h2>span")[i].textContent = amount;
    app.getAll(".container-two h2>span")[i].style.textAlign = "center";
    //each book
    let booksParent = app.getAll(".result")[i];
    let bookParent = app.createElement("div", "result-book", "", "", "", booksParent);
    let ImageParent = app.createElement("div", "result-book-img", "", "", "", bookParent);
    if (i == 0) {
        let ImgHref = app.createElement("a", "", "", "href", href, ImageParent);
        app.createElement("img", "", "", "src", bookCover, ImgHref);
    } else { app.createElement("img", "", "", "src", bookCover, ImageParent); }
    let bookInfoParent = app.createElement("div", "result-book-info", "", "", "", bookParent);
    let TitleParent = app.createElement("p", "", "書名：", "", "", bookInfoParent);
    app.createElement("span", "", bookTitle, "", "", TitleParent);
    let bookAuthorParent = app.createElement("p", "", "作者：", "", "", bookInfoParent);
    app.createElement("span", "", bookAuthor, "", "", bookAuthorParent);
    let PublisherParent = app.createElement("p", "", "出版社：", "", "", bookInfoParent);
    app.createElement("span", "", bookPublisher, "", "", PublisherParent);
    let ISBNParent = app.createElement("p", "", "ISBN-13：", "", "", bookInfoParent);
    app.createElement("span", "", bookISBN, "", "", ISBNParent);
    if (i == 1 || i == 2 || i == 3) {
        let addButton = app.createElement("button", "", "加入此書", "", "", bookInfoParent);
        addButton.addEventListener("click", function () {
            app.googleBooks.addToDB(bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover);
        });
    }
    if (amount == 1) { app.get(".result .result-book").style.width = "100%"; }
};

app.googleBooks.addToDB = function (bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover) {
    let newBook = {
        authors: bookAuthor.split("、"),
        coverURL: bookCover,
        lend: false,
        lendTo: "無",
        place: "尚未更新存放地點",
        publisher: bookPublisher,
        readStatus: "0",
        title: bookTitle,
        twice: false,
        isbn: bookISBN,
        calLink: "",
    };
    //send book data to DB
    app.database.ref("/members/" + app.uid + "/bookList/").push(newBook, function (error) {
        if (error) { console.log("Error of setting new book data."); }
        else { console.log("Set book data okay."); }
    }).then(function (res) {
        app.res = res;
        let link = res.path.pieces_[3];
        let edit = app.get(".alert>div>button:nth-child(1)");
        let keepAdd = app.get(".alert>div>button:nth-child(2)");
        let homePage = app.get(".alert>div>button:nth-child(3)");
        app.get(".alertDiv").style.display = "block";
        //edit book info
        edit.addEventListener("click", function () {
            window.location = "book.html?id=" + link;
        });
        //search next book
        keepAdd.addEventListener("click", function () {
            app.get(".alertDiv").style.display = "none";
            if (app.getAll(".lightbox-list")[app.containerNum - 1]) {
                //minus one due to search feature dont need lightbox-list feature
                app.getAll(".lightbox-list")[app.containerNum - 1].scrollIntoView({ block: "start", behavior: "smooth" });
            }
            if (app.get(".shot-list")) { app.get(".shot-list").scrollIntoView({ block: "start", behavior: "smooth" }); }
            if (app.get(".imgLoad")) { app.get(".imgLoad").textContent = ""; }
            app.getAll(".container-two")[app.containerNum].classList.remove("show-container");
            app.get("#keyword").value = "";
        });
        //back to homepage
        homePage.addEventListener("click", function () {
            app.get(".alertDiv").style.display = "none";
            app.get(".addShade").classList.remove("lightbox");
            app.get(".addShade").style.minHeight = "0";
            app.get(".scanShade").classList.remove("lightbox");
            app.get(".scanShade").style.minHeight = "0";
            app.getAll(".container-two")[app.containerNum].classList.remove("show-container");
            if (app.get(".line")) { app.get(".line").textContent = ""; }
            if (app.get(".imgLoad")) { app.get(".imgLoad").textContent = ""; }
            if (app.visualBook || app.visualBookMobile) {
                if (document.body.clientWidth > 1024) {
                    app.visualBook();
                } else {
                    app.visualBookMobile();
                }
            } else if (app.allocateBS) {
                app.allocateBS();
            }
        });
        //click on black shadow
        let alertDiv = app.get(".alertDiv");
        alertDiv.addEventListener("click", function (e) {
            if (e.target === alertDiv) {
                alertDiv.style.display = "none";
            }
        });
    });
};

// loading
app.showLoading = function () {
    app.get("#loading").style.display = "block";
};
app.closeLoading = function () {
    app.get("#loading").style.display = "none";
};


