import { app } from "../js/common.js";

app.init = function () {
    app.menu_open();
    app.menu_close();
    app.keyin_search();
};

app.keyin_search = function () {
    // 設定不同的搜尋方法   
    // 1. 選擇搜尋方式
    // 2. 使用者填入關鍵字
    // 3. 使用者點擊送出按鈕
    // 4. 依據使用者選擇的搜尋方式，將關鍵字丟入 fetch
    let searchType = app.get("#search-type");
    let clickKeyInSearch = app.get("#keyin-search");
    let keyWord;
    clickKeyInSearch.onclick = function () {
        keyWord = app.get("#keyword").value;
        app.search_book(keyWord);
        console.log(keyWord);
    };
    console.log(keyWord);
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
        });
};

app.getBookData = function (data) {
    // 抓到需要的不同資料
    // 1. 書名
    // 2. 作者
    // 3. 出版社
    // 4. ISBN-13
    // 5. 總頁數
    // 6. 書封照片
    for (let i = 0; i < data.items.length; i++) {
        let bookTitle;
        let bookAuthor;
        let bookPublisher;
        let bookISBN;
        let bookMaxPage;
        let bookCover;
        // console.log(data.items[i]);
        console.log(data.items[i].volumeInfo);
        //書名
        let title = data.items[i].volumeInfo.title;
        bookTitle = title; //存取書名       

        //作者 or 作者群
        let authors = data.items[i].volumeInfo.authors;
        if (authors != null) {
            bookAuthor = authors.join("、"); //存取作者
        }
        else if (authors == null) {
            bookAuthor = "暫無資料";
        }
        //出版社
        let publisher = data.items[i].volumeInfo.publisher;
        if (publisher != null) {
            bookPublisher = publisher;
        } else if (publisher == null) {
            bookPublisher = "暫無資料";
        }
        // ISBN
        let isbn = data.items[i].volumeInfo.industryIdentifiers;
        if (isbn != null) {
            console.log(isbn);
            let tmpISBN;
            for (let i = 0; i < isbn.length; i++) {
                if (isbn[i].type == "ISBN_13") {
                    tmpISBN = isbn[i].identifier;  //console.log(isbn[i].identifier); 
                }
            }
            if (tmpISBN != "" && tmpISBN != null) {
                bookISBN = tmpISBN;  // console.log("顯示 ISBN 13 碼");
            } else {
                bookISBN = "暫無資料";  // console.log("印出無 ISBN 13 碼");
            }
        } else if (isbn == null) {
            bookISBN = "暫無 ISBN-13 書碼"; // console.log("印出無 ISBN 13 碼");
        }
        // 最大頁數 pageCount
        let maxPage = data.items[i].volumeInfo.pageCount;
        if (maxPage != null) {
            bookMaxPage = maxPage; // console.log(maxPage);
        }
        else if (maxPage == null) {
            bookMaxPage = "請輸入總頁數";
        }
        // 書封照片
        let cover = data.items[i].volumeInfo.imageLinks;
        if (cover != null) {
            bookCover = cover.thumbnail;
        }
        else if (cover == null) {
            bookCover = "https://bit.ly/2ObFgq5";
        }
        app.showBookResult(bookTitle, bookAuthor, bookPublisher, bookISBN, bookMaxPage, bookCover);
    }
};

app.showBookResult = function (bookTitle, bookAuthor, bookPublisher, bookISBN, bookMaxPage, bookCover) {
    let booksParent = app.get(".result");

    //each book
    let bookParent = app.createElement("div", "result-book", "", "", "", booksParent);
    let ImageParent = app.createElement("div", "result-book-img", "", "", "", bookParent);
    let showImage = app.createElement("img", "", "", "src", bookCover, ImageParent);

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


    console.log(bookTitle, bookAuthor, bookPublisher, bookISBN, bookMaxPage, bookCover);
};

window.addEventListener("DOMContentLoaded", app.init);

// app.createElement = function (tagName, class_Name, text_Content, attr, attrText, parentElement) {
//     let obj = document.createElement(tagName);
//     obj.className = class_Name;
//     obj.textContent = text_Content;
//     obj[attr] = attrText;
//     if (parentElement instanceof Element) { parentElement.appendChild(obj); }
//     return obj;
// };