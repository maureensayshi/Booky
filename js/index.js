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
            if (document.body.clientWidth >= 980) {
                app.visualBook();
            } else {
                app.visualBookMobile();
            }
            app.menu();
            app.searchBar();
            app.keyin_search();
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
            for (let i = 0; i < bookListArrV.length; i++) {
                if (bookListArrV[i].readStatus == 2) {
                    listRead.push(bookListArrV[i]);
                    num = 5;
                } else if (bookListArrV[i].readStatus != 2) {
                    listShow.push(bookListArrV[i]);
                    num = listShow.length < 5 ? 5 - listShow.length : 0;
                }
            }
            console.log(num);

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
                    let bookRead = bookListArrV[i].readStatus == 1 ? "閱讀中" : "未讀";
                    //every book
                    let bookDivHref = app.createElement("a", "", "", "href", "/book.html?id=" + bookListArrK[i], box);
                    let bookDiv = app.createElement("div", "book-list-img", "", "", "", bookDivHref);
                    let bookImg = app.createElement("img", "", "", "src", bookListArrV[i].coverURL, bookDiv);
                    let bookHref = app.createElement("a", "spanBox", "", "href", "/book.html?id=" + bookListArrK[i], bookDiv);
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
            console.log(snapshot.val());
            let bookListArrV = Object.values(snapshot.val());
            let bookListArrK = Object.keys(snapshot.val());

            let listRead = [];
            let listShow = [];
            for (let i = 0; i < bookListArrV.length; i++) {
                if (bookListArrV[i].readStatus == 2) {
                    listRead.push(bookListArrV[i]);
                } else if (bookListArrV[i].readStatus != 2) {
                    listShow.push(bookListArrV[i]);
                }
            }

            for (let i = 0; i < listShow.length; i++) {
                let bookBox = app.createElement("div", "bookListMobileImg", "", "", "", box)
                let bookHref = app.createElement("a", "bookHref", "", "href", "/book.html?id=" + bookListArrK[i], bookBox);
                let bookDiv = app.createElement("img", "", "", "src", listShow[i].coverURL, bookHref);
            }

            app.get("#pre").style.display = "block";
            app.get("#next").style.display = "block";

            let eachBook = app.get(".bookListMobileImg").clientWidth;
            app.get("#pre").onclick = function () {
                box.scrollBy(-eachBook, 0);
            }
            app.get("#next").onclick = function () {
                box.scrollBy(eachBook, 0);
            }
        }



    }).catch((error) => {
        console.log(error);
    });
};

app.searchKeyWord = function () {
    let keyWord;
    keyWord = app.get("#keyword").value;
    app.search_book(keyWord);
    console.log(keyWord);
};

app.keyin_search = function () {
    // 直接按 Enter 搜尋
    let formSearch = app.get("#searchForm");
    formSearch.onsubmit = function () {
        let booksParent = app.get(".result");
        booksParent.innerHTML = "";
        booksParent.style.margin = "0px";
        app.searchKeyWord();
        return false;
    };

    // 點擊搜尋鍵搜尋
    let clickKeyInSearch = app.get("#keyin-search");
    clickKeyInSearch.onclick = function () {
        let booksParent = app.get(".result");
        booksParent.innerHTML = "";
        booksParent.style.margin = "0px";
        app.searchKeyWord();
    };

    let searchType = app.get("#search-type");
    app.search_book = function (keyWord) {
        switch (searchType.value) {
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
            app.getBookData(data);
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);
            app.get("main .container-two").style.display = "flex";
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
            app.get("main .container-two").style.display = "flex";
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
            app.get("main .container-two").style.display = "flex";
            app.get(".result").textContent = "無搜尋結果";
            app.get(".result").style.margin = "50px";
        });
};

app.getBookData = function (data) {
    // 抓到需要的不同資料
    for (let i = 0; i < data.items.length; i++) {
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
        let cover = data.items[i].volumeInfo.imageLinks;
        bookCover = (cover != null) ? cover.thumbnail : "https://bit.ly/2ObFgq5";
        app.showBookResult(bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover);
    }
};

app.showBookResult = function (bookTitle, bookAuthor, bookPublisher, bookISBN, bookCover) {
    // app.get("main .container").style.margin = "0 auto 0px auto";
    app.get("main .container-two").style.display = "flex";
    app.get("main .container-two").scrollIntoView({ block: "start", behavior: "smooth" });
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
    let addButton = app.createElement("button", "", "加入總書櫃", "", "", bookInfoParent);
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

window.addEventListener("DOMContentLoaded", app.init);


