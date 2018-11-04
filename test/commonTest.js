const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

// testing Gmail login ----------------------------------------------------
describe("# test1 : Gmail Login Status", function () {
    it("user should be login", function (done) {
        app.checkLogin().then(function (uid) {
            should.exist(uid);
            uid.should.be.a("string");
            done();
        }).catch(function (error) {
            done(error);
        });
    });
});

// testing Google books api----------------------------------------------------
describe("# test 2: Promise -- fetch to Google Books API", function () {
    it("Search by Title : Should return data", function (done) {
        app.googleBooks.fetch("intitle", "演算法").then(function (data) {
            should.exist(data);
            data.should.be.an("object");
            done();
        }).catch(function (error) {
            done(error);
        });
    });
    it("Search by ISBN : Should return data", function (done) {
        app.googleBooks.fetch("isbn", "9789862356319").then(function (data) {
            should.exist(data);
            data.should.be.an("object");
            done();
        }).catch(function (error) {
            done(error);
        });
    });
    it("Search by author : Should return data", function (done) {
        app.googleBooks.fetch("inauthor", "金庸").then(function (data) {
            should.exist(data);
            data.should.be.an("object");
            done();
        }).catch(function (error) {
            done(error);
        });
    });

    it("title of book should contain word key in by user", function (done) {
        app.googleBooks.fetch("intitle", "演算法").then(function (data) {
            if (data.items) {
                data.items.should.be.an("array");
                for (let i = 0; i < data.items.length; i++) {
                    expect(data.items[i].volumeInfo).to.have.property("title");
                    expect(data.items[i].volumeInfo.title).to.include.any.string("演算法");
                }
            }
            done();
        }).catch(function (error) {
            done(error);
        });
    });

    it("ISBN of book should contain number key in by user", function (done) {
        app.googleBooks.fetch("isbn", "9789862356319").then(function (data) {
            if (data.items) {
                data.items.should.be.an("array");
                for (let i = 0; i < data.items.length; i++) {
                    expect(data.items[i].volumeInfo).to.have.property("industryIdentifiers");
                    let isbn = data.items[i].volumeInfo.industryIdentifiers;
                    if (isbn) {
                        let tmpISBN;
                        for (let i = 0; i < isbn.length; i++) {
                            if (isbn[i].type === "ISBN_13")
                                tmpISBN = isbn[i].identifier;
                            expect(tmpISBN).to.equal("9789862356319");
                        }
                    }
                }
                done();
            }
        }).catch(function (error) {
            done(error);
        });
    });
});

//testing showing book -----------------------------------------------------
describe("# test 3 : check book information format before showing book on page", function () {
    let book = {
        amount: 2,
        title: "演算法圖鑑：26種演算法 + 7種資料結構，人工智慧、數據分析、邏輯思考的原理和應用全圖解",
        author: "石田保輝、宮崎修一",
        publisher: "臉譜",
        isbn: "9789862356319",
        coverURL: "http://books.google.com/books/content?id=VZVDDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
    };

    it("searcing book in Booky", function (done) {
        app.containerNum = 0;
        app.googleBooks.show(book);
        expect(app.getAll(".container-two")[app.containerNum].className).to.include("show-container");
        expect(app.getAll(".container-two")[app.containerNum].style.paddingBottom).to.equal("500px");
        expect(app.getAll(".container-two h2>span")[app.containerNum].textContent).to.equal("2");
        expect(app.get(".result-book-img a img").src).to.equal("http://books.google.com/books/content?id=VZVDDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api");
        expect(app.get(".result-book-info button")).to.not.exist;
        done();
    });

    it("add book by typing", function (done) {
        app.containerNum = 1;
        app.googleBooks.show(book);
        expect(app.get(".result-book-img img").src).to.equal("http://books.google.com/books/content?id=VZVDDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api");
        expect(app.get(".result-book-info button")).to.exist;
        done();
    });

    it("add book by scanning or photoing", function (done) {
        app.containerNum = 2;
        app.googleBooks.show(book);
        expect(app.getAll(".container-two h2>span")[app.containerNum].textContent).to.equal("1");
        expect(app.get(".result-book-info button")).to.exist;
        expect(book.amount).to.equal(1);
        expect(app.get(".result .result-book").style.width).to.equal("100%");
        done();
    });
});




