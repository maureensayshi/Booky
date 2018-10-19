"use strict";
// initialize firebase
let config = {
    apiKey: "AIzaSyALgpVirl6lyBvOK9W--e5QycFeMFzcPLg",
    authDomain: "booky-217508.firebaseapp.com",
    databaseURL: "https://booky-217508.firebaseio.com",
    projectId: "booky-217508",
    storageBucket: "booky-217508.appspot.com",
    messagingSenderId: "757419169220",

    clientId: "757419169220-9ehr4saki2pbqpp4c2imqa3qd8nbuf0q.apps.googleusercontent.com",

    scopes: [
        "email",
        "profile",
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events"
    ],
    discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
    ]
};

firebase.initializeApp(config);

// initialize app structure
let app = {
    database: firebase.database(),
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

// Other Func

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

// menu open and close
app.menu = function () {
    let menu_btn = app.get(".btn_menu");
    let menu = app.get(".menu");
    let close_menu = app.get(".close-menu");
    let shadow = app.get(".menu-shade");

    menu_btn.onclick = function () {
        menu.style.left = "0";
        menu.style.opacity = "1";
        menu.style.display = "flex";
        menu_btn.style.visibility = "hidden";
        if (window.innerWidth < 1025) {
            menu_btn.style.visibility = "visible";
        }
        shadow.style.left = "0%";
    };

    close_menu.onclick = function () {
        if (window.innerWidth >= 1025) {
            menu.style.left = "-350px";
        }
        else if (window.innerWidth < 1025) {
            menu.style.opacity = "0";
            menu.style.display = "none";
        }
        menu_btn.style.visibility = "visible";
        console.log("here");

        menu.style.opacity = "1";
        shadow.style.left = "-100%";
    };
};

//search bar
app.searchBar = function () {
    let search_btn = app.get(".btn_search");
    let searchPage = app.get(".search-shade");
    let close_search_btn = app.get(".searchbar-img>img");
    let result = app.getAll(".container-two");

    search_btn.onclick = function () {
        searchPage.style.visibility = "visible";
        searchPage.style.opacity = "1";
        searchPage.style.filter = "alpha(opacity=100)";
        app.get(".searchShade").style.minHeight = window.innerHeight + "px";
    };

    close_search_btn.onclick = function () {
        searchPage.style.visibility = "hidden";
        searchPage.style.opacity = "0";
        searchPage.style.filter = "alpha(opacity=0)";
        result[0].style.display = "none";
    };
    app.searchBarGo();
};

//搜尋書庫裡的書
app.searchBarGo = function () {
    let formSearchBar = app.get(".searchbar-form");
    formSearchBar.onsubmit = function () {
        let containerText = app.getAll(".container-two h2>span");
        let containerResult = app.getAll(".result");
        containerResult[0].style.justifyContent = "flex-start";
        containerText[0].textContent = "";
        containerResult[0].innerHTML = "";
        app.searchBarKeyWord = app.get(".searchbar-form>input").value;
        app.searchDB();
        return false;
    };
};

app.searchDB = function () {
    console.log(app.searchBarKeyWord);
    console.log(app.uid);
    app.bookMatch = [];
    let db = app.database;
    if (app.searchBarKeyWord) {
        let dbBookList = db.ref("/members/" + app.uid + "/bookList/");
        dbBookList.once("value", function (snapshot) {
            let bookListArrK = Object.keys(snapshot.val());
            let bookListArrV = Object.values(snapshot.val());
            let mixedStr = "";
            for (let i = 0; i < bookListArrV.length; i++) {
                let author = bookListArrV[i].authors.toString();
                mixedStr = bookListArrV[i].title + bookListArrV[i].publisher + bookListArrV[i].isbn + author;
                if (mixedStr.toLowerCase().indexOf(app.searchBarKeyWord.toLowerCase()) != -1) {
                    app.bookMatch.push(bookListArrK[i]);
                    let bookTitle = bookListArrV[i].title;
                    let bookAuthor = bookListArrV[i].authors.join("、");
                    let bookPublisher = bookListArrV[i].publisher;
                    let bookISBN = bookListArrV[i].isbn;
                    let bookCover = bookListArrV[i].coverURL;
                    let href = "book.html?id=" + bookListArrK[i];
                    let amount = app.bookMatch.length;
                    app.containerNum = 0;
                    app.showBookResult(bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover, amount, href);
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
    let result = app.get(".container-two");

    add_btn.onclick = function () {
        addPage.style.visibility = "visible";
        addPage.style.opacity = "1";
        addPage.style.filter = "alpha(opacity=100)";
        app.get(".addShade").style.minHeight = window.innerHeight + "px";
        app.typeInit();
        app.keyin_search();
    };

    close_add_btn.onclick = function () {
        addPage.style.visibility = "hidden";
        addPage.style.opacity = "0";
        addPage.style.filter = "alpha(opacity=0)";
        result.style.display = "none";
    };
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
    formSearch.onsubmit = function () {
        let containerText = app.getAll(".container-two h2>span");
        let containerResult = app.getAll(".result");
        containerResult[1].style.justifyContent = "flex-start";
        containerText[1].textContent = "";
        containerResult[1].innerHTML = "";
        app.searchKeyWord();
        return false;
    };

    // add book
    app.searchKeyWord = function () {
        let keyWord;
        keyWord = app.get("#keyword").value;
        app.search_book(keyWord);
        console.log(keyWord);
    };
};


//掃描書
app.scanBookInit = function () {
    let scan_btn = app.get("#scanbook");
    let scanPage = app.get(".scan-shade");
    let close_scan_btn = app.get(".scan-img>img");
    let result = app.get(".container-two");

    scan_btn.onclick = function () {
        scanPage.style.visibility = "visible";
        scanPage.style.opacity = "1";
        scanPage.style.filter = "alpha(opacity=100)";
        app.get(".scanShade").style.minHeight = window.innerHeight + "px";
        if (document.body.clientWidth > 1024) {
            app.get(".scan-list").style.display = "block";
            app.scan();
        } else {
            app.get(".shot-list").style.display = "block";
            app.imgScan();
        }
    };

    close_scan_btn.onclick = function () {
        scanPage.style.visibility = "hidden";
        scanPage.style.opacity = "0";
        scanPage.style.filter = "alpha(opacity=0)";
        result.style.display = "none";
    };
};

//桌機版:掃描搜尋
app.scan = function () {
    const codeReader = new ZXing.BrowserBarcodeReader();
    console.log("ZXing code reader initialized");

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
                    setTimeout(function () {
                        line.textContent = "SEARCHING......";
                        line.classList.add("typewriter");
                    }, 3000);

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
                            app.googleBooks_isbn(result.text);
                        }
                        console.log(result);

                    }).catch((err) => {
                        console.error(err);
                        line.textContent = "查無此書";
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
        console.log(app.get("#img-result>img").src);
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
    console.log(fileImg);

    let container = app.getAll(".container-two");
    let containerText = app.getAll(".container-two h2>span");
    let containerResult = app.getAll(".result");
    let uploadBtn = app.get(".shot-list label");

    codeReader.decodeFromImage(fileImg).then((result) => {
        console.log(result);
        app.get(".imgLoad").textContent = "ISBN : " + result.text;
        console.log(result.text);
        container[3].style.display = "block";
        containerResult[3].style.justifyContent = "center";
        containerText[3].textContent = "";
        containerResult[3].textContent = "";
        app.containerNum = 3;
        app.googleBooks_isbn(result.text);
        uploadBtn.textContent = "重新拍攝";
    }).catch((err) => {
        console.error(err);
        app.get(".imgLoad").textContent = "";
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
        app.googleBooks_title(keyWord);
        console.log(keyWord);
        break;
    case "search-isbn":
        app.googleBooks_isbn(keyWord);
        console.log(keyWord);
        break;
    case "search-author":
        app.googleBooks_author(keyWord);
        console.log(keyWord);
        break;
    case "":
        console.log("user didn't key in words");
        break;
    }
};

// 找書名
app.googleBooks_title = function (bookTitle) {
    fetch("https://www.googleapis.com/books/v1/volumes?q=intitle:" + bookTitle + "&maxResults=40&key=AIzaSyALgpVirl6lyBvOK9W--e5QycFeMFzcPLg")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            if (data.items) {
                app.getBookData(data);
            } else {
                let containerAll = app.getAll(".container-two");
                let containerText = app.getAll(".container-two h2>span");
                let containerResult = app.getAll(".result");
                let i = app.containerNum;
                if (containerAll[i]) {
                    containerAll[i].style.display = "flex";
                    containerAll[i].scrollIntoView({ block: "start", behavior: "smooth" });
                    containerResult[i].textContent = "請用其他關鍵字搜尋";
                    containerResult[i].style.justifyContent = "center";
                    containerText[i].textContent = 0;
                }
            }
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);
            let containerAll = app.getAll(".container-two");
            let containerText = app.getAll(".container-two h2>span");
            let containerResult = app.getAll(".result");
            let i = app.containerNum;
            if (containerAll[i]) {
                containerAll[i].style.display = "flex";
                containerAll[i].scrollIntoView({ block: "start", behavior: "smooth" });
                containerResult[i].textContent = "請用其他關鍵字搜尋";
                containerResult[i].style.justifyContent = "center";
                containerText[i].textContent = 0;
            }
        });
};

// 找 ISBN
app.googleBooks_isbn = function (bookISBN) {
    fetch("https://www.googleapis.com/books/v1/volumes?q=isbn:" + bookISBN + "&maxResults=40&key=AIzaSyALgpVirl6lyBvOK9W--e5QycFeMFzcPLg")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            if (data.items) {
                app.getBookData(data);
            } else {
                let containerAll = app.getAll(".container-two");
                let containerTextBox = app.getAll(".container-two h2");
                let containerText = app.getAll(".container-two h2>span");
                let containerResult = app.getAll(".result");
                let i = app.containerNum;
                if (containerAll[i]) {
                    containerAll[i].style.display = "block";
                    containerAll[i].style.textAlign = "center";
                    containerResult[i].textContent = "查無此書";
                    containerTextBox[i].style.textAlign = "center";
                    containerResult[i].style.justifyContent = "center";
                    containerText[i].style.textAlign = "center";
                    containerText[i].textContent = 0;
                }
            }
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);
            let containerAll = app.getAll(".container-two");
            let containerText = app.getAll(".container-two h2>span");
            let containerResult = app.getAll(".result");
            let i = app.containerNum;
            if (containerAll[i]) {
                console.log(i + "here");
                containerAll[i].style.display = "flex";
                containerAll[i].scrollIntoView({ block: "start", behavior: "smooth" });
                containerResult[i].textContent = "查無此書";
                containerResult[i].style.justifyContent = "center";
                containerText[i].textContent = 0;
            }
        });
};

// 找作者
app.googleBooks_author = function (bookAuthor) {
    fetch("https://www.googleapis.com/books/v1/volumes?q=inauthor:" + bookAuthor + "&maxResults=40&key=AIzaSyALgpVirl6lyBvOK9W--e5QycFeMFzcPLg")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            if (data.items) {
                app.getBookData(data);
            } else {
                let containerAll = app.getAll(".container-two");
                let containerText = app.getAll(".container-two h2>span");
                let containerResult = app.getAll(".result");
                let i = app.containerNum;
                if (containerAll[i]) {
                    console.log(i + "here");
                    containerAll[i].style.display = "flex";
                    containerAll[i].scrollIntoView({ block: "start", behavior: "smooth" });
                    containerResult[i].textContent = "請用其他關鍵字搜尋";
                    containerResult[i].style.justifyContent = "center";
                    containerText[i].textContent = 0;
                }
            }
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);

            let containerAll = app.getAll(".container-two");
            let containerText = app.getAll(".container-two h2>span");
            let containerResult = app.getAll(".result");
            let i = app.containerNum;
            if (containerAll[i]) {
                console.log(i + "here");
                containerAll[i].style.display = "flex";
                containerAll[i].scrollIntoView({ block: "start", behavior: "smooth" });
                containerResult[i].textContent = "查無此書";
                containerResult[i].style.justifyContent = "center";
                containerText[i].textContent = 0;
            }
        });
};

app.getBookData = function (data) {
    console.log(data);
    let amount = 0;
    if (data.items) {
        // 抓到需要的不同資料
        for (let i = 0; i < data.items.length; i++) {
            amount = data.items.length;
            let bookTitle;  // 1. 書名
            let bookAuthor;  // 2. 作者
            let bookPublisher; // 3. 出版社
            let bookISBN;  // 4. ISBN-13
            let bookCover; // 5. 書封照片
            //書名
            let title = data.items[i].volumeInfo.title;
            bookTitle = title; //存取書名       
            //作者 or 作者群
            let authors = data.items[i].volumeInfo.authors;
            bookAuthor = (authors != null) ? authors.join("、") : "暫無資料";
            //出版社
            let publisher = data.items[i].volumeInfo.publisher;
            bookPublisher = (publisher != null) ? publisher : "暫無資料";
            // ISBN
            let isbn = data.items[i].volumeInfo.industryIdentifiers;
            if (isbn != null) {
                let tmpISBN;
                for (let i = 0; i < isbn.length; i++) {
                    if (isbn[i].type == "ISBN_13")
                        tmpISBN = isbn[i].identifier;
                }
                bookISBN = (tmpISBN != "" && tmpISBN != null) ? tmpISBN : "暫無資料";
            } else if (isbn == null) {
                bookISBN = "暫無資料"; // console.log("印出無 ISBN 13 碼");
            }
            // 書封照片
            let fakeCovers = ["./img/fakesample1.svg", "./img/fakesample2.svg", "./img/fakesample3.svg"];
            let fakeCover = fakeCovers[Math.floor(Math.random() * fakeCovers.length)];
            let cover = data.items[i].volumeInfo.imageLinks;
            bookCover = (cover != null) ? cover.thumbnail : fakeCover;
            app.showBookResult(bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover, amount, "");
        }
    } else {
        console.log("no book");
        let containerAll = app.getAll(".container-two");
        let containerText = app.getAll(".container-two h2>span");
        let containerResult = app.getAll(".result");
        let i = app.containerNum;
        if (containerAll[i]) {
            console.log(i + "here");
            containerAll[i].style.display = "flex";
            containerAll[i].scrollIntoView({ block: "start", behavior: "smooth" });
            containerResult[i].textContent = "查無此書";
            containerResult[i].style.justifyContent = "center";
            containerText[i].textContent = 0;
        }
    }
};

app.showBookResult = function (bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover, amount, href) {
    console.log(bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover);
    let containerAll = app.getAll(".container-two");
    let containerText = app.getAll(".container-two h2>span");
    let containerResult = app.getAll(".result");
    let i = app.containerNum;
    console.log(i);

    if (containerAll[i]) {
        containerAll[i].style.display = "block";
        containerAll[i].style.textAlign = "center";
        containerAll[i].style.paddingBottom = "500px";
        containerAll[i].scrollIntoView({ block: "start", behavior: "smooth" });
        if (i == 2) {
            amount = 1;
        }
        containerText[i].style.textAlign = "center";
        containerText[i].textContent = amount;
        let booksParent = containerResult[i];
        //each book
        let bookParent = app.createElement("div", "result-book", "", "", "", booksParent);
        let ImageParent = app.createElement("div", "result-book-img", "", "", "", bookParent);
        if (i == 0) {
            let ImgHref = app.createElement("a", "", "", "href", href, ImageParent);
            let showImage = app.createElement("img", "", "", "src", bookCover, ImgHref);
        } else {
            let showImage = app.createElement("img", "", "", "src", bookCover, ImageParent);
        }
        // each book info
        let bookInfoParent = app.createElement("div", "result-book-info", "", "", "", bookParent);
        let TitleParent = app.createElement("p", "", "書名：", "", "", bookInfoParent);
        let showTitle = app.createElement("span", "", bookTitle, "", "", TitleParent);
        let bookAuthorParent = app.createElement("p", "", "作者：", "", "", bookInfoParent);
        let showAuthor = app.createElement("span", "", bookAuthor, "", "", bookAuthorParent);
        let PublisherParent = app.createElement("p", "", "出版社：", "", "", bookInfoParent);
        let showPublisher = app.createElement("span", "", bookPublisher, "", "", PublisherParent);
        let ISBNParent = app.createElement("p", "", "ISBN-13：", "", "", bookInfoParent);
        let showISBN = app.createElement("span", "", bookISBN, "", "", ISBNParent);
        if (i == 1 || i == 2 || i == 3) {
            let addButton = app.createElement("button", "", "加入此書", "", "", bookInfoParent);
            //加入總書櫃按鈕
            addButton.addEventListener("click", function () {
                app.addBook(bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover);
            });
        }
    }

    if (amount == 1) {
        app.get(".result .result-book").style.width = "100%";
    }
};

app.addBook = function (bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover) {
    console.log(bookAuthor);
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
        if (error) {
            console.log("Error of setting new book data.");
        } else {
            console.log("Set book data okay.");
            alert("加入 " + newBook.title + " 到總書櫃");
            if (app.visualBook || app.visualBookMobile) {
                if (document.body.clientWidth > 1024) {
                    app.visualBook();
                } else {
                    app.visualBookMobile();
                }
            } else if (app.allocateBS) {
                app.allocateBS();
            }
        }
    }).then(function (res) {
        console.log(res);
    });
};

// loading
app.showLoading = function () {
    app.get("#loading").style.display = "block";
};
app.closeLoading = function () {
    app.get("#loading").style.display = "none";
};


