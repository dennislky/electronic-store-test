const chai = require("chai");
const chaiHttp = require("chai-http");
const Mongoose = require("mongoose");

const connectionManager = require("../connection");
const server = require("../app");
const Utils = require("./utils");

const ProductModel = require("../model/product");
const DiscountDealModel = require("../model/discountDeal");

chai.should();
chai.use(chaiHttp);

// mock data
const productMockData = {
  productNormal1: {
    _id: Mongoose.Types.ObjectId("64e244a7bf7efa0f497e8ffd"),
    name: "productNormal1",
    price: 100,
  },
  productNormal2: {
    _id: Mongoose.Types.ObjectId("64e244b5cc8b19895a2779d0"),
    name: "productNormal2",
    price: 200,
  },
  productMissingName: {
    _id: Mongoose.Types.ObjectId("64e38649e181603aca5551b7"),
    price: 100,
  },
  productMissingPrice: {
    _id: Mongoose.Types.ObjectId("64e3864ecaf8769b67dc8a30"),
    name: "productMissingPrice",
  },
};
const discountDealMockData = {
  discountDealBuy1Get1FreeForProduct1: {
    _id: Mongoose.Types.ObjectId("64e23f6ab294febbbba272e5"),
    type: "buy1Get1Free",
    productId: [productMockData.productNormal1._id],
  },
  discountDealBuy1Get50percentOffTheSecondForProduct2: {
    _id: Mongoose.Types.ObjectId("64e23f772e36a8a66ca5a2dd"),
    type: "buy1Get50PercentOffTheSecond",
    productId: [productMockData.productNormal2._id],
  },
  discountDealBundleDiscount: {
    _id: Mongoose.Types.ObjectId("64e23f7d41b96e2fb7837ace"),
    type: "bundleDiscount",
    productId: [
      productMockData.productNormal1._id,
      productMockData.productNormal2._id,
    ],
    percentage: 0.7,
  },
  discountDealMissingType: {
    _id: Mongoose.Types.ObjectId("64e3a0a13c74c8c1d12a58c7"),
    productId: [productMockData.productNormal2._id],
  },
  discountDealWrongType: {
    _id: Mongoose.Types.ObjectId("64e3a0a13c74c8c1d12a58c7"),
    type: "wrongType",
    productId: [productMockData.productNormal2._id],
  },
};

describe("Admin User Operations - Mongoose", () => {
  // setup & hooks
  let mongooseInstance;
  before(async () => {
    mongooseInstance = await connectionManager();
  });
  afterEach(async () => {
    await ProductModel.deleteMany();
    await DiscountDealModel.deleteMany();
  });
  after(async () => {
    await mongooseInstance.connection.close();
  });

  // basic tests
  it("should create a new product", async () => {
    const response = await chai
      .request(server)
      .post("/product")
      .send(productMockData.productNormal1);
    response.should.have.status(201);
    const omittedReponse = Utils.omitResponse(response, ["_id", "__v"]);
    omittedReponse.name.should.eql(productMockData.productNormal1.name);
    omittedReponse.price.should.eql(productMockData.productNormal1.price);
  });

  it("should remove a product", async () => {
    const product = await chai
      .request(server)
      .post("/product")
      .send(productMockData.productNormal1);
    product.should.have.status(201);
    const response = await chai
      .request(server)
      .delete(`/product/${product.body._id}`);
    response.should.have.status(200);
    response.body.should.eql({ productId: product.body._id });
  });

  it("should add discount deals for products", async () => {
    const product1 = await chai
      .request(server)
      .post("/product")
      .send(productMockData.productNormal1);
    product1.should.have.status(201);
    const product2 = await chai
      .request(server)
      .post("/product")
      .send(productMockData.productNormal2);
    product2.should.have.status(201);

    const discountDeal1 = {
      _id: Mongoose.Types.ObjectId("64e23f6ab294febbbba272e5"),
      type: "buy1Get1Free",
      productId: [product1.body._id],
    };
    const response1 = await chai
      .request(server)
      .post("/discountDeal")
      .send(discountDeal1);
    response1.should.have.status(201);
    const omittedReponse1 = Utils.omitResponse(response1, ["_id", "__v"]);
    omittedReponse1.type.should.eql(discountDeal1.type);
    omittedReponse1.productId
      .toString()
      .should.eql(discountDeal1.productId.toString());

    const discountDeal2 = {
      _id: Mongoose.Types.ObjectId("64e23f772e36a8a66ca5a2dd"),
      type: "buy1Get50PercentOffTheSecond",
      productId: [product2.body._id],
    };
    const response2 = await chai
      .request(server)
      .post("/discountDeal")
      .send(discountDeal2);
    response2.should.have.status(201);
    const omittedReponse2 = Utils.omitResponse(response2, ["_id", "__v"]);
    omittedReponse2.type.should.eql(discountDeal2.type);
    omittedReponse2.productId
      .toString()
      .should.eql(discountDeal2.productId.toString());

    const discountDeal3 = {
      _id: Mongoose.Types.ObjectId("64e23f7d41b96e2fb7837ace"),
      type: "bundleDiscount",
      productId: [product1.body._id, product2.body._id],
      percentage: 0.7,
    };
    const response3 = await chai
      .request(server)
      .post("/discountDeal")
      .send(discountDeal3);
    response3.should.have.status(201);
    const omittedReponse3 = Utils.omitResponse(response3, ["_id", "__v"]);
    omittedReponse3.type.should.eql(discountDeal3.type);
    omittedReponse3.productId
      .toString()
      .should.eql(discountDeal3.productId.toString());
    omittedReponse3.percentage.should.eql(discountDeal3.percentage);
  });

  // advanced tests
  //// error tests
  ////// wrong method tests
  it("should return 405 if wrong method of /product is called", async () => {
    let response = await chai
      .request(server)
      .put("/product")
      .send(productMockData.productNormal1);
    response.should.have.status(405);

    response = await chai
      .request(server)
      .patch("/product")
      .send(productMockData.productNormal1);
    response.should.have.status(405);

    response = await chai
      .request(server)
      .delete("/product")
      .send(productMockData.productNormal1);
    response.should.have.status(405);
  });

  it("should return 405 if wrong method of /product/:id is called", async () => {
    const product = await chai
      .request(server)
      .post("/product")
      .send(productMockData.productNormal1);
    product.should.have.status(201);

    let response = await chai
      .request(server)
      .post(`/product/${product.body._id}`)
      .send(productMockData.productNormal1);
    response.should.have.status(405);

    response = await chai
      .request(server)
      .put(`/product/${product.body._id}`)
      .send(productMockData.productNormal1);
    response.should.have.status(405);

    response = await chai
      .request(server)
      .patch(`/product/${product.body._id}`)
      .send(productMockData.productNormal1);
    response.should.have.status(405);
  });

  it("should return 405 if wrong method of /discountDeal is called", async () => {
    let response = await chai
      .request(server)
      .put("/discountDeal")
      .send(productMockData.productNormal1);
    response.should.have.status(405);

    response = await chai
      .request(server)
      .patch("/discountDeal")
      .send(productMockData.productNormal1);
    response.should.have.status(405);

    response = await chai
      .request(server)
      .delete("/discountDeal")
      .send(productMockData.productNormal1);
    response.should.have.status(405);
  });

  it("should return 405 if wrong method of /discountDeal/:id is called", async () => {
    const discountDeal = await chai
      .request(server)
      .post("/discountDeal")
      .send(
        discountDealMockData.discountDealBuy1Get50percentOffTheSecondForProduct2
      );
    discountDeal.should.have.status(201);

    let response = await chai
      .request(server)
      .post(`/discountDeal/${discountDeal.body._id}`)
      .send(
        discountDealMockData.discountDealBuy1Get50percentOffTheSecondForProduct2
      );
    response.should.have.status(405);

    response = await chai
      .request(server)
      .put(`/discountDeal/${discountDeal.body._id}`)
      .send(
        discountDealMockData.discountDealBuy1Get50percentOffTheSecondForProduct2
      );
    response.should.have.status(405);

    response = await chai
      .request(server)
      .patch(`/discountDeal/${discountDeal.body._id}`)
      .send(
        discountDealMockData.discountDealBuy1Get50percentOffTheSecondForProduct2
      );
    response.should.have.status(405);
  });

  ////// wrong params tests
  it("should return 400 if name or price is missing when creating product", async () => {
    const responseMissingName = await chai
      .request(server)
      .post("/product")
      .send(productMockData.productMissingName);
    responseMissingName.should.have.status(400);

    const responseMissingPrice = await chai
      .request(server)
      .post("/product")
      .send(productMockData.productMissingPrice);
    responseMissingPrice.should.have.status(400);
  });

  it("should throw error if remove a product that does not exist", async () => {
    const response = await chai.request(server).delete(`/product/1`);
    response.should.have.status(500);
  });

  it("should return 400 if type is missing when creating discountDeal", async () => {
    const responseMissingType = await chai
      .request(server)
      .post("/discountDeal")
      .send(discountDealMockData.discountDealMissingType);
    responseMissingType.should.have.status(400);
  });

  it("should return 500 if type is wrong when creating discountDeal", async () => {
    const responseMissingType = await chai
      .request(server)
      .post("/discountDeal")
      .send(discountDealMockData.discountDealWrongType);
    responseMissingType.should.have.status(500);
  });

  //// concurrency tests
  it("should create new products", async () => {
    const promise1 = chai
      .request(server)
      .post("/product")
      .send(productMockData.productNormal1);
    const promise2 = chai
      .request(server)
      .post("/product")
      .send(productMockData.productNormal2);

    const [response1, response2] = await Promise.all([promise1, promise2]);
    response1.should.have.status(201);
    response2.should.have.status(201);
  });

  it("should create 1 new product only", async () => {
    const promise1 = chai
      .request(server)
      .post("/product")
      .send(productMockData.productNormal1);
    const promise2 = chai
      .request(server)
      .post("/product")
      .send(productMockData.productNormal1);

    const [response1, response2] = await Promise.all([promise1, promise2]);
    response1.should.have.status(201);
    response2.should.have.status(500);
  });

  it("should remove 1 existing product only", async () => {
    const addPromise1 = chai
      .request(server)
      .post("/product")
      .send(productMockData.productNormal1);
    const addPromise2 = chai
      .request(server)
      .post("/product")
      .send(productMockData.productNormal2);

    const [addResponse1, addResponse2] = await Promise.all([
      addPromise1,
      addPromise2,
    ]);
    addResponse1.should.have.status(201);
    addResponse2.should.have.status(201);

    const removePromise1 = chai
      .request(server)
      .delete(`/product/${addResponse1.body._id}`);
    const removePromise2 = chai
      .request(server)
      .delete(`/product/${addResponse1.body._id}`);

    const [removeResponse1, removeResponse2] = await Promise.all([
      removePromise1,
      removePromise2,
    ]);
    removeResponse1.should.have.status(200);
    removeResponse2.should.have.status(200);
  });

  it("should create new discountDeals", async () => {
    const promise1 = chai
      .request(server)
      .post("/discountDeal")
      .send(discountDealMockData.discountDealBuy1Get1FreeForProduct1);
    const promise2 = chai
      .request(server)
      .post("/discountDeal")
      .send(
        discountDealMockData.discountDealBuy1Get50percentOffTheSecondForProduct2
      );

    const [response1, response2] = await Promise.all([promise1, promise2]);
    response1.should.have.status(201);
    response2.should.have.status(201);
  });

  it("should create 1 new discount deal only", async () => {
    const promise1 = chai
      .request(server)
      .post("/discountDeal")
      .send(
        discountDealMockData.discountDealBuy1Get50percentOffTheSecondForProduct2
      );
    const promise2 = chai
      .request(server)
      .post("/discountDeal")
      .send(
        discountDealMockData.discountDealBuy1Get50percentOffTheSecondForProduct2
      );

    const [response1, response2] = await Promise.all([promise1, promise2]);
    response1.should.have.status(201);
    response2.should.have.status(500);
  });
});

module.exports = { productMockData, discountDealMockData };
