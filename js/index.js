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
            app.get(".welcome").style.display = "none";
            app.get(".real").style.display = "block";
            app.visualBook();
            app.menu();
            app.searchBar();
            app.keyin_search();
            app.closeLoading();

        } else {
            // User is signed out or haven't sign up.
            app.get(".welcome").style.display = "block";
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
    let box = app.get(".book-list");
    let slideBG = app.get(".sliding-background");
    let db = app.database;
    let dbBookList = db.ref("/members/" + app.uid + "/bookList/");
    dbBookList.once("value", function (snapshot) {
        console.log(snapshot.val());
        let bookListArrV = Object.values(snapshot.val());
        let num = 0;
        if (bookListArrV.length < 5) {
            num = 5 - bookListArrV.length;
        }
        //show book list from db
        //first round
        for (let i = 0; i < bookListArrV.length; i++) {
            let pic = document.createElement("img");
            pic.src = bookListArrV[i].coverURL;
            box.appendChild(pic);
        }
        //sample book color
        let colorArr = ["#DCB58C", "#EAA140", "#B9B144"];
        // let color = colorArr[Math.floor(Math.random() * colorArr.length)];

        if (bookListArrV.length < 5) {
            let sample = document.createElement("div");
            sample.className = "sample-book";
            sample.style.backgroundColor = colorArr[Math.floor(Math.random() * colorArr.length)];

            for (let i = 0; i < num; i++) {
                box.appendChild(sample.cloneNode());
            }
        }
        //second round
        for (let i = 0; i < bookListArrV.length; i++) {
            let pictwo = document.createElement("img");
            pictwo.src = bookListArrV[i].coverURL;
            box.appendChild(pictwo);
        }
        if (bookListArrV.length < 5) {
            let sampletwo = document.createElement("div");
            sampletwo.className = "sample-book";
            sampletwo.style.backgroundColor = colorArr[Math.floor(Math.random() * colorArr.length)];

            for (let i = 0; i < num; i++) {
                box.appendChild(sampletwo.cloneNode());
            }
        }
        console.log(box);
        //key visual animation
        slideBG.animate([
            // keyframes
            { transform: "translate3d(0, 0, 0)" },
            { transform: "translate3d(-" + ((bookListArrV.length + num) * 168) + "px, 0, 0)" }
        ], {
            // timing options
            duration: ((bookListArrV.length + num) * 168 * 1000) / 56,
            iterations: Infinity
        });

    });

    // let index = 0;
    // next_btn.onclick = function () {
    //     let bookArrNode = app.getAll(".book-list>img");
    //     let bookArr = Array.apply(null, bookArrNode);
    //     index++;
    //     box.style.left = (0 - index * 168) + "px";
    //     let leftImg = bookArr.shift();
    //     //在右側創造一個img，裝著最左側那一個的img src
    //     let newImg = document.createElement("img");
    //     newImg.src = leftImg.src;
    //     console.log(newImg);
    //     //刪除最左側那一個
    //     // bookArr.shift();
    //     //把新的img放到陣列最後面
    //     box.removeChild(leftImg);
    //     box.appendChild(newImg);
    // };
    // pre_btn.onclick = function () {
    //     let box = app.get(".real-visual");
    //     let bookArrNode = app.getAll(".real-visual>img");
    //     let bookArr = Array.apply(null, bookArrNode);
    //     index--;
    //     box.style.left = (0 - index * 168) + "px";
    // };

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


