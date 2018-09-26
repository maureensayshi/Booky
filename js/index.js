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
            // 抓到需要的不同資料
            for (let i = 0; i < data.items.length; i++) {
                // console.log(data.items[i]);
                console.log(data.items[i].volumeInfo);
                //書名
                let title = data.items[i].volumeInfo.title;
                //作者 or 作者群
                let authors = data.items[i].volumeInfo.authors;
                if (authors != null) {
                    console.log(authors.join("、"));//作者群名字字串(加上頓號)
                }
                else if (authors == null) {
                    console.log("暫無作者資訊");
                }
                //出版社
                let publisher = data.items[i].volumeInfo.publisher;
                if (publisher != null) {
                    console.log(publisher);
                } else if (publisher == null) {
                    console.log("暫無出版社資訊");
                }
                // ISBN
                let isbn = data.items[i].volumeInfo.industryIdentifiers;
                if (isbn != null) {
                    console.log(isbn);
                    let tmpISBN;
                    for (let i = 0; i < isbn.length; i++) {
                        if (isbn[i].type == "ISBN_13") {
                            console.log(isbn[i].identifier); // ISBN 13 碼
                            tmpISBN = isbn[i].identifier;
                        }
                    }
                    if (tmpISBN != "" && tmpISBN != null) {
                        console.log("顯示 ISBN 13 碼");
                        app.get("#hi").textContent = tmpISBN;
                    } else {
                        console.log("印出無 ISBN 13 碼");
                        app.get("#hi").textContent = "無結果";
                    }
                } else if (isbn == null) {
                    console.log("印出無 ISBN 13 碼");
                }
                // 最大頁數 pageCount
                let maxPage = data.items[i].volumeInfo.pageCount;
                if (maxPage != null) {
                    console.log(maxPage);
                }
                else if (maxPage == null) {
                    console.log("no pageCount");
                }
                // 書封照片
                let cover = data.items[i].volumeInfo.imageLinks;
                if (cover != null) {
                    console.log(cover);
                    console.log(cover.thumbnail); //書封照片 src
                }
                else if (cover == null) {
                    console.log("no book cover");
                }
            }
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
        })
        .catch(function (error) {
            console.log("error : can't fetch to google books API" + error);
        });
};

window.addEventListener("DOMContentLoaded", app.init);