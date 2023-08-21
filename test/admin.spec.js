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
      _id: mongoose.ObjectId("64e23f6ab294febbbba272e5"),
      type: "buy1Get1Free",
      productId: [product1._id],
    };
    const response1 = await chai
      .request(server)
      .post("/discountDeal")
      .send(discountDeal1);
    response1.should.have.status(201);
    const omittedReponse1 = Utils.omitResponse(response1, ["_id", "__v"]);
    omittedReponse1.body.should.eql(discountDeal1);

    const discountDeal2 = {
      _id: mongoose.ObjectId("64e23f772e36a8a66ca5a2dd"),
      type: "buy1Get50PercentOffTheSecond",
      productId: [product2._id],
    };
    const response2 = await chai
      .request(server)
      .post("/discountDeal")
      .send(discountDeal2);
    response2.should.have.status(201);
    const omittedReponse2 = Utils.omitResponse(response2, ["_id", "__v"]);
    omittedReponse2.body.should.eql(discountDeal2);

    const discountDeal3 = {
      _id: mongoose.ObjectId("64e23f7d41b96e2fb7837ace"),
      type: "bundleDiscount",
      productId: [product1._id, product2._id],
      percentage: 0.7,
    };
    const response3 = await chai
      .request(server)
      .post("/discountDeal")
      .send(discountDeal3);
    response3.should.have.status(201);
    const omittedReponse3 = Utils.omitResponse(response3, ["_id", "__v"]);
    omittedReponse3.body.should.eql(discountDeal3);
  });

  // advanced tests
  //// error tests
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

  it("should return 405 if wrong method of / is called", async () => {
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

  it("should return 405 if wrong method of /:id is called", async () => {
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
  //// concurrency tests
});

module.exports = { productMockData, discountDealMockData };
