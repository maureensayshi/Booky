"use strict";
// initialize firebase
firebase.initializeApp({
    apiKey: "AIzaSyALgpVirl6lyBvOK9W--e5QycFeMFzcPLg",
    authDomain: "booky-217508.firebaseapp.com",
    databaseURL: "https://booky-217508.firebaseio.com",
    projectId: "booky-217508",
    storageBucket: "booky-217508.appspot.com",
    messagingSenderId: "757419169220"
});

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
                // User is signed out or haven't sign up.
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
    let menu_btn = app.get(".btn_menu>img");
    let menu = app.get(".menu");
    let close_menu = app.get(".close-menu");
    let shadow = app.get(".menu-shade");

    menu_btn.onclick = function () {
        menu.style.left = "0";
        menu_btn.style.visibility = "hidden";
        shadow.style.left = "0%";
    };

    close_menu.onclick = function () {
        if (window.innerWidth > 1200) {
            menu.style.left = "-350px";
        } else if (window.innerWidth < 1200 && window.innerWidth > 980) {
            menu.style.left = "-320px";
        } else if (window.innerWidth < 980 && window.innerWidth > 480) {
            menu.style.left = "-250px";
        } else if (window.innerWidth < 480 && window.innerWidth >= 320) {
            menu.style.left = "-180px";
        }
        menu_btn.style.visibility = "visible";
        shadow.style.left = "-100%";
    };
};

//search bar
app.searchBar = function () {
    let search_btn = app.get("header .btn_search input");
    let searchPage = app.get(".search-shade");
    let close_search_btn = app.get(".searchbar-img>img");

    search_btn.onclick = function () {
        searchPage.style.visibility = "visible";
        searchPage.style.opacity = "1";
        searchPage.style.filter = "alpha(opacity=100)";
    };

    close_search_btn.onclick = function () {
        searchPage.style.visibility = "hidden";
        searchPage.style.opacity = "0";
        searchPage.style.filter = "alpha(opacity=0)";
    };
    app.searchBarGo();
};

//搜尋書庫裡的書
app.searchBarGo = function () {
    let formSearchBar = app.get(".searchbar-form");
    formSearchBar.onsubmit = function () {
        app.searchBarKeyWord = app.get(".searchbar-form>input").value;
        app.searchDB();
        return false;
    };
};

app.searchDB = function () {
    console.log(app.searchBarKeyWord);
    console.log(app.uid);

    let db = app.database;
    if (app.searchBarKeyWord) {
        let dbBookList = db.ref("/members/" + app.uid + "/bookList/");
        dbBookList.once("value", function (snapshot) {
            console.log(snapshot.val());
            let bookListArrK = Object.keys(snapshot.val());
            let bookListArrV = Object.values(snapshot.val());
            let mixedStr = "";
            for (let i = 0; i < bookListArrV.length; i++) {
                let author = bookListArrV[i].authors.toString();
                mixedStr = bookListArrV[i].title + bookListArrV[i].publisher + bookListArrV[i].isbn + author;
                console.log(mixedStr);
                if (mixedStr.toLowerCase().indexOf(app.searchBarKeyWord.toLowerCase()) != -1) {
                    console.log(bookListArrV[i], bookListArrK[i]);
                    window.location = "/?search=" + app.searchBarKeyWord;
                    app.get(".view").style.display = "none";
                } else {
                    console.log("無搜尋結果");
                }
            }
        });
    }
};

// add book
app.addBookInit = function () {
    let add_btn = app.get("#addbook");

    let addPage = app.get(".add-shade");
    let close_add_btn = app.get(".add-img>img");

    add_btn.onclick = function () {
        addPage.style.visibility = "visible";
        addPage.style.opacity = "1";
        addPage.style.filter = "alpha(opacity=100)";
        app.get(".addShade").style.minHeight = window.innerHeight + "px";
        app.keyin_search();
        app.typeInit();
    };

    close_add_btn.onclick = function () {
        addPage.style.visibility = "hidden";
        addPage.style.opacity = "0";
        addPage.style.filter = "alpha(opacity=0)";
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

//掃描書
app.scanBookInit = function () {
    let scan_btn = app.get("#scanbook");
    let scanPage = app.get(".scan-shade");
    let close_scan_btn = app.get(".scan-img>img");

    scan_btn.onclick = function () {
        scanPage.style.visibility = "visible";
        scanPage.style.opacity = "1";
        scanPage.style.filter = "alpha(opacity=100)";
        app.get(".scanShade").style.minHeight = window.innerHeight + "px";
    };

    close_scan_btn.onclick = function () {
        scanPage.style.visibility = "hidden";
        scanPage.style.opacity = "0";
        scanPage.style.filter = "alpha(opacity=0)";
    };
};

app.keyin_search = function () {
    // 直接按 Enter 搜尋
    let formSearch = app.get("#searchForm");
    formSearch.onsubmit = function () {
        let booksParent = app.get(".result");
        booksParent.innerHTML = "";
        booksParent.style.margin = "0px";
        app.get(".container-two h2>span").textContent = "";
        app.searchKeyWord();
        return false;
    };

    // 點擊搜尋鍵搜尋
    let clickKeyInSearch = app.get("#keyin-search");
    clickKeyInSearch.onclick = function () {
        let booksParent = app.get(".result");
        booksParent.innerHTML = "";
        booksParent.style.margin = "0px";
        app.get(".container-two h2>span").textContent = "";
        app.searchKeyWord();
    };

    // add book
    app.searchKeyWord = function () {
        let keyWord;
        keyWord = app.get("#keyword").value;
        app.search_book(keyWord);
        console.log(keyWord);
    };

    app.search_book = function (keyWord) {
        console.log(app.searchText);
        switch (app.searchText) {
            case "search-title":
                app.googleBooks_title(keyWord);
                break;
            case "search-isbn":
                app.googleBooks_isbn(keyWord);
                break;
            case "search-author":
                app.googleBooks_author(keyWord);
                break;
            case "":
                console.log("user didn't key in words");
                break;
        }
    };
};

// 找書名
app.googleBooks_title = function (bookTitle) {
    fetch("https://www.googleapis.com/books/v1/volumes?q=intitle:" + bookTitle + "&maxResults=40&key=AIzaSyAIhKztMyiZescidKArwy41HAZirttLUHg")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            if (data.items) {
                app.getBookData(data);
            }
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);
            app.get(".container-two").style.display = "flex";
            app.get(".result").textContent = "無搜尋結果";
            app.get(".result").style.margin = "50px";
        });
};

// 找 ISBN
app.googleBooks_isbn = function (bookISBN) {
    fetch("https://www.googleapis.com/books/v1/volumes?q=isbn:" + bookISBN + "&maxResults=40&key=AIzaSyAIhKztMyiZescidKArwy41HAZirttLUHg")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            app.getBookData(data);
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);
            app.get(".container-two").style.display = "flex";
            app.get(".result").textContent = "無搜尋結果";
            app.get(".result").style.margin = "50px";
        });
};

// 找作者
app.googleBooks_author = function (bookAuthor) {
    fetch("https://www.googleapis.com/books/v1/volumes?q=inauthor:" + bookAuthor + "&maxResults=40&key=AIzaSyAIhKztMyiZescidKArwy41HAZirttLUHg")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            app.getBookData(data);
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);
            app.get(".container-two").style.display = "flex";
            app.get(".result").textContent = "無搜尋結果";
            app.get(".result").style.margin = "50px";
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
            // console.log(authors);

            //出版社
            let publisher = data.items[i].volumeInfo.publisher;
            bookPublisher = (publisher != null) ? publisher : "暫無資料";
            // ISBN
            let isbn = data.items[i].volumeInfo.industryIdentifiers;
            if (isbn != null) {
                // console.log(isbn);
                let tmpISBN;
                for (let i = 0; i < isbn.length; i++) {
                    if (isbn[i].type == "ISBN_13")
                        tmpISBN = isbn[i].identifier;  //console.log(isbn[i].identifier); 
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
            app.showBookResult(bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover, amount);
        }
    } else {
        console.log("no book");
        app.get(".container-two").style.display = "flex";
        app.get(".container-two").scrollIntoView({ block: "start", behavior: "smooth" });
        app.get(".result").textContent = "查無此書";
        app.get(".container-two h2>span").textContent = amount;
    }
};

app.showBookResult = function (bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover, amount) {
    console.log(bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover);

    app.get(".container-two").style.display = "flex";
    app.get(".container-two").scrollIntoView({ block: "start", behavior: "smooth" });
    app.get(".container-two h2>span").textContent = amount;
    let booksParent = app.get(".result");
    //each book
    let bookParent = app.createElement("div", "result-book", "", "", "", booksParent);
    let ImageParent = app.createElement("div", "result-book-img", "", "", "", bookParent);
    let showImage = app.createElement("img", "", "", "src", bookCover, ImageParent);
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
    let addButton = app.createElement("button", "", "加入此書", "", "", bookInfoParent);
    //加入總書櫃按鈕
    addButton.addEventListener("click", function () {
        app.addBook(bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover);
    });
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
    };
    //send book data to DB
    let db = app.database;
    db.ref("/members/" + app.uid + "/bookList/").push(newBook, function (error) {
        if (error) {
            console.log("Error of setting new book data.");
        } else {
            console.log("Set book data okay.");
            alert("加入 " + newBook.title + " 到總書櫃");
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

