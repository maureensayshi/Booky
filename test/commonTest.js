
describe("index", function () {
    it("testing app", function () {
        chai.assert.equal(app.testing(), "hello");
    });
});

// const assert = require("chai").assert;
// const test = require("../booky/js/test");
// const common = require("../booky/js/common");
// sayHelloResult = test.sayHello();
// addNumsResult = test.addNums(5, 5);
// describe("common", function () {
//     it("testing app", function () {
//         assert.equal(common.testing(), "hello");
//     });
// });
// describe("Test", function () {
//     describe("sayHello()", function () {
//         it("say hello for the first time", function () {
//             assert.equal(sayHelloResult, "hello");
//         });
//     });

//     describe("addNums()", function () {
//         it("num should more than 5", function () {
//             assert.equal(addNumsResult, "10");
//         });
//     });
// });