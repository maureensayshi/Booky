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
        app.getAll(".container-two")[0].style.display = "none";
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
            if (app.bookMatch.length == 0) {
                let containerAll = app.getAll(".container-two");
                let containerText = app.getAll(".container-two h2>span");
                let containerResult = app.getAll(".result");
                containerAll[0].style.display = "block";
                containerAll[0].style.textAlign = "center";
                containerAll[0].scrollIntoView({ block: "start", behavior: "smooth" });
                containerResult[0].textContent = "您沒有相關書籍在 Booky";
                containerResult[0].style.justifyContent = "center";
                containerText[0].textContent = 0;
            }
        });
    }
};

// add book
app.addBookInit = function () {
    let add_btn = app.get("#addbook");
    let addPage = app.get(".add-shade");
    let close_add_btn = app.get(".add-img>img");
    let result = app.getAll(".container-two");
    let keyword = app.get("#keyword");

    add_btn.addEventListener("click", function () {
        addPage.classList.add("lightbox");
        app.get(".addShade").style.minHeight = window.innerHeight + "px";
        app.typeInit();
        app.keyin_search();
    });

    close_add_btn.addEventListener("click", function (e) {
        addPage.classList.remove("lightbox");
        result[1].style.display = "none";
        keyword.value = "";
    });
};

//先判斷使用者選擇哪種搜尋方式
app.typeInit = function () {
    let threeType = app.getAll(".addtab");
    console.log(threeType);
    app.searchText = app.get(".active").value;
    for (let i = 0; i < threeType.length; i++) {
        threeType[i].addEventListener("click", app.switchType);
    }
};

app.switchType = function (e) {
    let threeType = app.getAll(".addtab");
    for (let i = 0; i < threeType.length; i++) {
        threeType[i].classList.remove("active");
    }
    e.currentTarget.classList.add("active");
    app.searchText = e.target.value;
    console.log(app.searchText);
};


app.keyin_search = function () {
    // 直接按 Enter 搜尋
    let formSearch = app.get("#searchForm");
    let container = app.getAll(".container-two");
    let containerText = app.getAll(".container-two h2>span");
    let containerResult = app.getAll(".result");
    formSearch.onsubmit = function () {
        containerResult[1].style.justifyContent = "flex-start";
        containerText[1].textContent = "";
        containerResult[1].innerHTML = "";
        app.searchKeyWord();
        return false;
    };
    // get key word
    app.searchKeyWord = function () {
        let keyWord;
        keyWord = app.get("#keyword").value;
        if (keyWord) {
            app.search_book(keyWord);
        } else {
            container[1].style.display = "none";
            console.log("使用者沒輸入文字");
        }
    };
};


//掃描書
app.scanBookInit = function () {
    let scan_btn = app.get("#scanbook");
    let scanPage = app.get(".scan-shade");
    let close_scan_btn = app.get(".scan-img>img");
    let result = app.getAll(".container-two");
    scan_btn.addEventListener("click", function () {
        scanPage.classList.add("lightbox");
        app.get(".scanShade").style.minHeight = window.innerHeight + "px";
        if (document.body.clientWidth > 1024) {
            app.get(".scan-list").style.display = "block";
            app.scan();
        } else {
            app.get(".shot-list").style.display = "block";
            app.imgScan();
        }
    });

    close_scan_btn.addEventListener("click", function () {
        scanPage.classList.remove("lightbox");
        result[2].textContent = "";
        codeReader.reset();
    });
};

const codeReader = new ZXing.BrowserBarcodeReader();
console.log("ZXing code reader initialized");

//桌機版:掃描搜尋
app.scan = function () {
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
                const sourceSelectPanel = document.getElementById("sourceSelectPanel");
            }
            let startBtn = app.get("#startButton");
            let line = app.get(".line");
            let container = app.getAll(".container-two");
            let containerText = app.getAll(".container-two h2>span");
            let containerResult = app.getAll(".result");

            startBtn.addEventListener("click", () => {
                container[2].style.display = "none";
                containerResult[2].style.justifyContent = "flex-start";
                containerText[2].textContent = "";
                containerResult[2].textContent = "";
                if (startBtn.value == "start") {
                    startBtn.value = "stop";
                    startBtn.textContent = "停止掃描";
                    line.textContent = "SEARCHING......";
                    line.classList.add("typewriter");
                    codeReader.decodeFromInputVideoDevice(undefined, "video").then((result) => {
                        if (result) {
                            line.textContent = "ISBN : " + result.text;
                            line.classList.remove("typewriter");
                            startBtn.textContent = "重新掃描";
                            container[2].style.display = "block";
                            containerResult[2].style.justifyContent = "center";
                            containerText[2].textContent = "";
                            containerResult[2].textContent = "";
                            app.containerNum = 2;
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
                    console.log(`Started continous decode from camera with id ${firstDeviceId}`);
                } else if (startBtn.value == "stop") {
                    startBtn.value = "start";
                    startBtn.textContent = "打開相機";
                    line.textContent = "";
                    line.classList.remove("typewriter");
                    codeReader.reset();
                }
            });
        })
        .catch((err) => {
            console.error(err);
        });
};

//拍照搜尋
app.imgScan = function () {
    console.log("scan img");
    function ProcessFile(e) {
        let file = document.getElementById("file").files[0];
        app.get("#img-result>img").src = URL.createObjectURL(file);
    }
    document.getElementById("file").addEventListener("change",
        ProcessFile, false);
    app.get("#img-result>img").onload = function () {
        app.decodeFun();
    };
};

//拍照後搜尋資料庫
app.decodeFun = function (ev) {
    const codeReader = new ZXing.BrowserBarcodeReader("video");
    console.log("ZXing code reader initialized");
    let fileImg = app.get("#img-result>img");
    let container = app.getAll(".container-two");
    let containerText = app.getAll(".container-two h2>span");
    let containerResult = app.getAll(".result");
    let uploadBtn = app.get(".shot-list label");

    codeReader.decodeFromImage(fileImg).then((result) => {
        app.get(".imgLoad").textContent = "ISBN : " + result.text;
        container[3].style.display = "block";
        containerResult[3].style.justifyContent = "center";
        containerText[3].textContent = "";
        containerResult[3].textContent = "";
        app.containerNum = 3;
        app.googleBooks.fetch("isbn", result.text).then(function (data) {
            app.googleBooks.getData(data);
        }).catch(function (error) {
            app.googleBooks.errorHandler(error);
        });
        uploadBtn.textContent = "重新拍攝";
    }).catch((err) => {
        app.get(".imgLoad").textContent = "未偵測到條碼";
        container[3].style.display = "block";
        containerResult[3].style.justifyContent = "center";
        containerText[3].textContent = "0";
        containerResult[3].textContent = "無搜尋結果，請重新拍攝";
        uploadBtn.textContent = "重新拍攝";
    });
    console.log(`Started decode for image from ${fileImg.src}`);
};


app.search_book = function (keyWord) {
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
    let containerAll = app.getAll(".container-two");
    let containerText = app.getAll(".container-two h2>span");
    let containerResult = app.getAll(".result");
    let i = app.containerNum;
    if (containerAll[i]) {
        containerAll[i].style.display = "flex";
        containerAll[i].scrollIntoView({ block: "start", behavior: "smooth" });
        containerResult[i].textContent = "請用其他關鍵字搜尋";
        console.log(containerResult[i]);
        containerResult[i].style.justifyContent = "center";
        containerText[i].textContent = 0;
    }
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
    let containerAll = app.getAll(".container-two");
    let containerText = app.getAll(".container-two h2>span");
    let containerResult = app.getAll(".result");
    let i = app.containerNum;
    if (containerAll[i]) {
        containerAll[i].style.display = "block";
        containerAll[i].style.textAlign = "center";
        containerAll[i].style.paddingBottom = "500px";
        containerAll[i].scrollIntoView({ block: "start", behavior: "smooth" });
        if (i == 2) { amount = 1; }
        containerText[i].style.textAlign = "center";
        containerText[i].textContent = amount;
        let booksParent = containerResult[i];
        //each book
        let bookParent = app.createElement("div", "result-book", "", "", "", booksParent);
        let ImageParent = app.createElement("div", "result-book-img", "", "", "", bookParent);
        if (i == 0) {
            let ImgHref = app.createElement("a", "", "", "href", href, ImageParent);
            app.createElement("img", "", "", "src", bookCover, ImgHref);
        } else { app.createElement("img", "", "", "src", bookCover, ImageParent); }
        // each book info
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
                app.googleBooks.update(bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover);
            });
        }
    }
    if (amount == 1) { app.get(".result .result-book").style.width = "100%"; }
};

app.googleBooks.update = function (bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover) {
    let eachAuthor = bookAuthor.split("、");
    //prepare book data for DB
    let newBook = {
        authors: eachAuthor,
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
    let db = app.database;
    db.ref("/members/" + app.uid + "/bookList/").push(newBook, function (error) {
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
            app.get(".addbar-list").scrollIntoView({ block: "start", behavior: "smooth" });
            app.get(".scan-list").scrollIntoView({ block: "start", behavior: "smooth" });
            app.get(".shot-list").scrollIntoView({ block: "start", behavior: "smooth" });
            app.get("#keyword").value = "";
        });
        //back to homepage
        homePage.addEventListener("click", function () {
            app.get(".alertDiv").style.display = "none";
            app.get(".addShade").classList.remove("lightbox");
            app.get(".addShade").style.minHeight = "0";
            app.get(".scanShade").classList.remove("lightbox");
            app.get(".scanShade").style.minHeight = "0";
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


