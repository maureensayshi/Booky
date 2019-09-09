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
const app = {
    database: firebase.database(),
    storage: firebase.storage(),
    apiKey: config.apiKey,
    searchBook: {},
    addBook: {},
    scanBook: {},
    googleBooks: {},
    bookShelf: {},
    eachBook: { googleCal: {}, },
    member: {},
    googleLogin: {}
};

app.checkLogin = function () {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                resolve(user.uid);
                //console.log(user.uid);
            } else {
                reject(window.location = "/");
            }
        });
    });
};


app.get = function (selector) {
    return document.querySelector(selector);
};

app.getAll = function (selector) {
    return document.querySelectorAll(selector);
};

app.createElement = function (tagName, class_Name, text_Content, attr, attrText, parentElement) {
    let obj = document.createElement(tagName);
    obj.className = class_Name;
    obj.textContent = text_Content;
    obj[attr] = attrText;
    if (parentElement instanceof Element) { parentElement.appendChild(obj); }
    return obj;
};

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

//search bar------------------------------------------------------------------------------
app.searchBook.Init = function () {
    let searchBtn = app.get(".btn_search");
    let searchPage = app.get(".search-shade");
    let closeBtn = app.get(".searchbar-img>img");
    let searchText = app.get(".searchbar-form>input");
    searchBtn.addEventListener("click", function () {
        searchPage.classList.add("lightbox");
        app.get(".searchShade").style.minHeight = window.innerHeight + "px";
        app.searchBook.getInput();
    });
    closeBtn.addEventListener("click", function () {
        searchPage.classList.remove("lightbox");
        app.getAll(".container-two")[0].classList.remove("show-container");
        searchText.value = "";
    });

};

//get keyword by user key-in
app.searchBook.getInput = function () {
    let formSearchBar = app.get(".searchbar-form");
    formSearchBar.addEventListener("submit", function (e) {
        e.preventDefault();
        app.searchBook.input = app.get(".searchbar-form>input").value;
        app.searchBook.getResult();
        app.getAll(".container-two")[0].classList.remove("show-container");
        app.getAll(".result")[0].innerHTML = "";
    });
};

//search keyword in booky database
app.searchBook.getResult = function () {
    app.bookMatch = [];
    if (app.searchBook.input) {
        app.database.ref("/members/" + app.uid + "/bookList/").once("value", function (snapshot) {
            let bookListArrK = Object.keys(snapshot.val());
            let bookListArrV = Object.values(snapshot.val());
            let mixedStr = "";
            for (let i = 0; i < bookListArrV.length; i++) {
                let author = bookListArrV[i].authors.toString();
                mixedStr = bookListArrV[i].title + bookListArrV[i].publisher + bookListArrV[i].isbn + author;
                if (mixedStr.toLowerCase().indexOf(app.searchBook.input.toLowerCase()) != -1) {
                    app.containerNum = 0;
                    app.bookMatch.push(bookListArrK[i]);
                    let book = {
                        amount: app.bookMatch.length,
                        title: bookListArrV[i].title,
                        author: bookListArrV[i].authors.join("、"),
                        publisher: bookListArrV[i].publisher,
                        isbn: bookListArrV[i].isbn,
                        coverURL: bookListArrV[i].coverURL,
                        href: "book.html?id=" + bookListArrK[i],
                    };
                    app.googleBooks.show(book);
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
    app.addBook.typeListener();
    app.addBook.getInput();
    addBtn.addEventListener("click", function () {
        addPage.classList.add("lightbox");
        app.get(".addShade").style.minHeight = window.innerHeight + "px";
    });

    closeBtn.addEventListener("click", function () {
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
    let formSearch = app.get("#searchForm");

    formSearch.addEventListener("submit", function (e) {
        e.preventDefault();
        app.getAll(".container-two")[1].classList.remove("show-container");
        app.getAll(".result")[1].style.justifyContent = "flex-start";
        app.getAll(".result")[1].innerHTML = "";
        let keyWord = app.get("#keyword").value;
        if (keyWord) { app.addBook.getResult(keyWord); }
    });
};

app.addBook.fetchBook = function (searchingType, keyWord) {
    app.googleBooks.fetch(searchingType, keyWord).then(function (data) {
        for (let i = 0; i < data.items.length; i++) {
            app.googleBooks.show(app.googleBooks.getData(data, i));
        }
    }).catch(function (error) {
        app.googleBooks.errorHandler(error);
    });
};

app.addBook.getResult = function (keyWord) {
    app.containerNum = 1;
    switch (app.searchText) {
    case "search-title":
        app.addBook.fetchBook("intitle", keyWord);
        break;
    case "search-isbn":
        app.addBook.fetchBook("isbn", keyWord);
        break;
    case "search-author":
        app.addBook.fetchBook("inauthor", keyWord);
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
                app.getAll(".container-two h2>span")[2].textContent = "";
                app.getAll(".result")[2].textContent = "";
                app.getAll(".result")[2].style.justifyContent = "center";
                if (startBtn.value === "start") {
                    line.textContent = "SEARCHING......";
                    line.classList.add("typewriter");
                    codeReader.decodeFromInputVideoDevice(undefined, "video").then((result) => {
                        if (result) {
                            line.textContent = "ISBN : " + result.text;
                            line.classList.remove("typewriter");
                            app.addBook.fetchBook("isbn", result.text);
                            codeReader.reset();
                            startBtn.textContent = "打開相機";
                            startBtn.value = "start";
                        }
                    }).catch((err) => {
                        //console.error(err);
                        line.textContent = "查無此書";
                        line.classList.remove("typewriter");
                        codeReader.reset();
                        startBtn.textContent = "打開相機";
                        startBtn.value = "start";
                    });
                    startBtn.textContent = "重新掃描";
                    //console.log(`Started continous decode from camera with id ${firstDeviceId}`);
                } else if (startBtn.value === "stop") {
                    codeReader.reset();
                    startBtn.textContent = "打開相機";
                    startBtn.value = "start";
                    line.textContent = "";
                    line.classList.remove("typewriter");
                    //remove title
                    app.getAll(".container-two")[2].classList.remove("show-container");
                }
            });
        })
        .catch((err) => {
            // console.log(err);
        });
};

// add book ( mobile )--------------------------------------------------------------------------------------
app.scanBook.imgScan = function () {
    function ProcessFile() {
        app.containerNum = 3;
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

//search google books after user taking photo
app.scanBook.imgScan.decodeFun = function () {
    const codeReader = new ZXing.BrowserBarcodeReader("video");
    let fileImg = app.get("#img-result>img");
    let uploadBtn = app.get(".shot-list label");
    codeReader.decodeFromImage(fileImg).then((result) => {
        app.containerNum = 3;
        app.get(".imgLoad").textContent = "ISBN : " + result.text;
        app.getAll(".container-two")[3].classList.add("show-container");
        app.getAll(".container-two h2>span")[3].textContent = "";
        app.getAll(".container-two h2>span")[3].textContent = "";
        app.addBook.fetchBook("isbn", result.text);
        uploadBtn.textContent = "重新拍攝";
    }).catch(() => {
        app.containerNum = 3;
        app.get(".imgLoad").textContent = "未偵測到條碼";
        app.getAll(".container-two")[3].classList.add("show-container");
        app.getAll(".container-two h2>span")[3].textContent = "0";
        app.getAll(".result")[3].textContent = "無搜尋結果，請重新拍攝";
        uploadBtn.textContent = "重新拍攝";
    });
    //console.log(`Started decode for image from ${fileImg.src}`);
};

//fetch to google books API--------------------------------------------------------------
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
    //console.log(error);
};

// get data from google books API -------------------------------------------------------
app.googleBooks.getData = function (data, i) {
    let authors = data.items[i].volumeInfo.authors;
    let publisher = data.items[i].volumeInfo.publisher;
    let isbn = data.items[i].volumeInfo.industryIdentifiers;
    let cover = data.items[i].volumeInfo.imageLinks;
    let fakeCovers = ["./img/fakesample1.svg", "./img/fakesample2.svg", "./img/fakesample3.svg"];
    let fakeCover = fakeCovers[Math.floor(Math.random() * fakeCovers.length)];

    let book = {
        amount: data.items.length,
        title: data.items[i].volumeInfo.title,
        author: (authors) ? authors.join("、") : "暫無資料",
        publisher: (publisher) ? publisher : "暫無資料",
        isbn: "",
        coverURL: (cover) ? cover.thumbnail : fakeCover,
        href: "",
    };

    if (isbn) {
        let tmpISBN;
        for (let i = 0; i < isbn.length; i++) {
            if (isbn[i].type === "ISBN_13")
                tmpISBN = isbn[i].identifier;
        }
        book.isbn = (tmpISBN) ? tmpISBN : "暫無資料";
    } else if (!isbn) { book.isbn = "暫無資料"; }

    return book;
};

// Show data from google books API ---------------------------------------------
app.googleBooks.show = function (book) {
    let i = app.containerNum;
    // //console.log(app.containerNum);
    app.getAll(".container-two")[i].classList.add("show-container");
    app.getAll(".container-two")[i].style.paddingBottom = "500px";
    app.getAll(".container-two")[i].scrollIntoView({ block: "start", behavior: "smooth" });
    if (i === 2) { book.amount = 1; }
    app.getAll(".container-two h2>span")[i].textContent = book.amount;
    app.getAll(".container-two h2>span")[i].style.textAlign = "center";
    //each book
    let booksParent = app.getAll(".result")[i];
    let bookParent = app.createElement("div", "result-book", "", "", "", booksParent);
    let ImageParent = app.createElement("div", "result-book-img", "", "", "", bookParent);
    if (i == 0) {
        let ImgHref = app.createElement("a", "", "", "href", book.href, ImageParent);
        app.createElement("img", "", "", "src", book.coverURL, ImgHref);
    } else { app.createElement("img", "", "", "src", book.coverURL, ImageParent); }
    let bookInfoParent = app.createElement("div", "result-book-info", "", "", "", bookParent);
    let TitleParent = app.createElement("p", "", "書名：", "", "", bookInfoParent);
    app.createElement("span", "", book.title, "", "", TitleParent);
    let bookAuthorParent = app.createElement("p", "", "作者：", "", "", bookInfoParent);
    app.createElement("span", "", book.author, "", "", bookAuthorParent);
    let PublisherParent = app.createElement("p", "", "出版社：", "", "", bookInfoParent);
    app.createElement("span", "", book.publisher, "", "", PublisherParent);
    let ISBNParent = app.createElement("p", "", "ISBN-13：", "", "", bookInfoParent);
    app.createElement("span", "", book.isbn, "", "", ISBNParent);
    if (i == 1 || i == 2 || i == 3) {
        let addButton = app.createElement("button", "", "加入此書", "", "", bookInfoParent);
        addButton.addEventListener("click", function () {
            app.googleBooks.addToDB(book);
        });
    }
    if (book.amount == 1) { app.get(".result .result-book").style.width = "100%"; }
};

app.googleBooks.addToDB = function (book) {
    let newBook = {
        authors: book.author.split("、"),
        coverURL: book.coverURL,
        lend: false,
        lendTo: "無",
        place: "尚未更新存放地點",
        publisher: book.publisher,
        readStatus: "0",
        title: book.title,
        twice: false,
        isbn: book.isbn,
        calLink: "",
    };
    //send book data to DB
    app.database.ref("/members/" + app.uid + "/bookList/").push(newBook, function (error) {
        //console.log(error);
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
            if (app.get(".line")) { app.get(".line").textContent = ""; }
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
                let userAgent = navigator.userAgent;
                let isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") < 1;
                if (document.body.clientWidth < 1024) {
                    app.visualBookMobile();
                } else if (userAgent.match("Edge") || isSafari) {
                    app.visualBookInstead();
                } else {
                    app.visualBook();
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

app.testing = function () {
    return "hello";
};

export default app;