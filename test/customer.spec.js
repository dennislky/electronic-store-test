const chai = require("chai");
const chaiHttp = require("chai-http");
const Mongoose = require("mongoose");

const connectionManager = require("../connection");
const server = require("../app");
const Utils = require("./utils");

const ProductModel = require("../model/product");
const DiscountDealModel = require("../model/discountDeal");
const BasketModel = require("../model/basket");

const { productMockData, discountDealMockData } = require("./admin.spec");

chai.should();
chai.use(chaiHttp);

// mock data
const mockData = {
  userId: 1,
  customerActionAddProduct1: {
    action: "add",
    productId: productMockData.productNormal1._id,
    timestamp: 1692547131,
  },
  customerActionAddProduct2: {
    action: "add",
    productId: productMockData.productNormal2._id,
    timestamp: 1692547132,
  },
  customerActionRemoveProduct1: {
    action: "remove",
    productId: productMockData.productNormal1._id,
    timestamp: 1692547133,
  },
  customerActionRemoveProduct2: {
    action: "remove",
    productId: productMockData.productNormal2._id,
    timestamp: 1692547134,
  },
  customerActionTypeWrong: {
    action: "wrong",
    productId: productMockData.productNormal1._id,
    timestamp: 1692547133,
  },
  customerActionTypeMissing: {
    productId: productMockData.productNormal1._id,
    timestamp: 1692547133,
  },
  applyDiscountDealBuy1Get1FreeForProduct1: {
    action: "discountDeal",
    discountDealId:
      discountDealMockData.discountDealBuy1Get1FreeForProduct1._id,
    timestamp: 1692547135,
  },
  applyDiscountDealBuy1Get50percentOffTheSecondForProduct2: {
    action: "discountDeal",
    discountDealId:
      discountDealMockData.discountDealBuy1Get50percentOffTheSecondForProduct2
        ._id,
    timestamp: 1692547136,
  },
  applyDiscountDealBundleDiscount: {
    action: "discountDeal",
    discountDealId: discountDealMockData.discountDealBundleDiscount._id,
    timestamp: 1692547137,
  },
};

describe("Customer Operations - Mongoose", () => {
  // setup & hooks
  let mongooseInstance;
  before(async () => {
    mongooseInstance = await connectionManager();
  });
  afterEach(async () => {
    await ProductModel.deleteMany();
    await DiscountDealModel.deleteMany();
    await BasketModel.deleteMany();
  });
  after(async () => {
    await mongooseInstance.connection.close();
  });

  // basic tests
  it("should add and remove products to and from a basket", async () => {
    const action1 = {
      ...mockData.customerActionAddProduct1,
      quantity: 1,
    };
    const response1 = await chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(action1);
    response1.should.have.status(200);
    const omittedResponse1 = Utils.omitResponse(response1, ["_id", "__v"]);
    omittedResponse1.items[0].productId
      .toString()
      .should.eql(action1.productId.toString());
    omittedResponse1.items[0].quantity.should.eql(action1.quantity);
    omittedResponse1.items[0].actionTimestamp.should.eql(action1.timestamp);

    const action2 = {
      ...mockData.customerActionAddProduct2,
      quantity: 2,
    };
    const response2 = await chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(action2);
    response2.should.have.status(200);
    const omittedResponse2 = Utils.omitResponse(response2, ["_id", "__v"]);
    omittedResponse2.items[0].productId
      .toString()
      .should.eql(action1.productId.toString());
    omittedResponse2.items[0].quantity.should.eql(action1.quantity);
    omittedResponse2.items[0].actionTimestamp.should.eql(action1.timestamp);
    omittedResponse2.items[1].productId
      .toString()
      .should.eql(action2.productId.toString());
    omittedResponse2.items[1].quantity.should.eql(action2.quantity);
    omittedResponse2.items[1].actionTimestamp.should.eql(action2.timestamp);

    const action3 = {
      ...mockData.customerActionRemoveProduct1,
      quantity: 1,
    };
    const response3 = await chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(action3);
    response3.should.have.status(200);
    const omittedResponse3 = Utils.omitResponse(response3, ["_id", "__v"]);
    omittedResponse3.items[0].productId
      .toString()
      .should.eql(action2.productId.toString());
    omittedResponse3.items[0].quantity.should.eql(action2.quantity);
    omittedResponse3.items[0].actionTimestamp.should.eql(action2.timestamp);

    const action4 = {
      ...mockData.customerActionRemoveProduct2,
      quantity: 1,
    };
    const response4 = await chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(action4);
    response4.should.have.status(200);
    const omittedResponse4 = Utils.omitResponse(response4, ["_id", "__v"]);
    omittedResponse4.items[0].productId
      .toString()
      .should.eql(action4.productId.toString());
    omittedResponse4.items[0].quantity.should.eql(
      action2.quantity - action4.quantity
    );
    omittedResponse4.items[0].actionTimestamp.should.eql(action4.timestamp);
  });

  it("should calculate a receipt of items", async () => {
    const productResponse1 = await chai
      .request(server)
      .post("/product")
      .send(productMockData.productNormal1);
    productResponse1.should.have.status(201);

    const productResponse2 = await chai
      .request(server)
      .post("/product")
      .send(productMockData.productNormal2);
    productResponse2.should.have.status(201);

    const discountDeal = {
      _id: Mongoose.Types.ObjectId("64e23f772e36a8a66ca5a2dd"),
      type: "buy1Get50PercentOffTheSecond",
      productId: [productResponse2.body._id],
    };
    const discountDealResponse = await chai
      .request(server)
      .post("/discountDeal")
      .send(discountDeal);
    discountDealResponse.should.have.status(201);

    const action1 = {
      ...mockData.customerActionAddProduct1,
      quantity: 1,
    };
    const response1 = await chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(action1);
    response1.should.have.status(200);

    const action2 = {
      ...mockData.customerActionAddProduct2,
      quantity: 3,
    };
    const response2 = await chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(action2);
    response2.should.have.status(200);

    const action3 = {
      ...mockData.customerActionRemoveProduct2,
      quantity: 1,
    };
    const response3 = await chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(action3);
    response3.should.have.status(200);

    const action4 =
      mockData.applyDiscountDealBuy1Get50percentOffTheSecondForProduct2;
    const response4 = await chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(action4);
    response4.should.have.status(200);
    const omittedResponse4 = Utils.omitResponse(response4, ["_id", "__v"]);
    omittedResponse4.items[0].productId
      .toString()
      .should.eql(action1.productId.toString());
    omittedResponse4.items[0].quantity.should.eql(action1.quantity);
    omittedResponse4.items[0].actionTimestamp.should.eql(action1.timestamp);
    omittedResponse4.items[1].productId
      .toString()
      .should.eql(action3.productId.toString());
    omittedResponse4.items[1].quantity.should.eql(
      action2.quantity - action3.quantity
    );
    omittedResponse4.items[1].actionTimestamp.should.eql(action3.timestamp);
    omittedResponse4.appliedDiscountDealId
      .toString()
      .should.eql(action4.discountDealId.toString());

    const receiptResponse = await chai
      .request(server)
      .get(`/basket/${mockData.userId}/receipt`);
    receiptResponse.should.have.status(200);
    receiptResponse.body.purchasedItems[0].productId.name.should.eql(
      productMockData.productNormal1.name
    );
    receiptResponse.body.purchasedItems[1].productId.name.should.eql(
      productMockData.productNormal2.name
    );
    receiptResponse.body.appliedDiscountDeal.type.should.eql(
      discountDealMockData.discountDealBuy1Get50percentOffTheSecondForProduct2
        .type
    );
    receiptResponse.body.appliedDiscountDeal.productId[0]
      .toString()
      .should.eql(
        discountDealMockData.discountDealBuy1Get50percentOffTheSecondForProduct2.productId[0].toString()
      );
    receiptResponse.body.totalPrice.should.eql(
      productMockData.productNormal1.price +
        productMockData.productNormal2.price * 2 -
        productMockData.productNormal2.price * 0.5
    );
  });

  // advanced tests
  //// error tests
  ////// wrong method tests
  it("should return 405 if wrong method of /basket is called", async () => {
    let response = await chai.request(server).get("/basket");
    response.should.have.status(405);

    response = await chai.request(server).post("/basket");
    response.should.have.status(405);

    response = await chai.request(server).put("/basket");
    response.should.have.status(405);

    response = await chai.request(server).patch("/basket");
    response.should.have.status(405);

    response = await chai.request(server).delete("/basket");
    response.should.have.status(405);
  });

  it("should return 405 if wrong method of /basket/:id is called", async () => {
    let response = await chai.request(server).post("/basket/:id");
    response.should.have.status(405);

    response = await chai.request(server).put("/basket");
    response.should.have.status(405);
  });

  ////// wrong params tests
  it("should return 400 if basket not exist and action is remove", async () => {
    const response = await chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(mockData.customerActionRemoveProduct1);
    response.should.have.status(400);
  });

  it("should return 400 if action type is wrong/missing", async () => {
    const response1 = await chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(mockData.customerActionTypeWrong);
    response1.should.have.status(400);

    const response2 = await chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(mockData.customerActionTypeMissing);
    response2.should.have.status(400);
  });

  it("should return 400 if body is missing", async () => {
    const response = await chai
      .request(server)
      .patch(`/basket/${mockData.userId}`);
    response.should.have.status(400);
  });

  //// concurrency tests
  it("should not add and remove products to and from a basket concurrently", async () => {
    const action1 = {
      ...mockData.customerActionAddProduct1,
      quantity: 1,
    };
    const promise1 = chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(action1);

    const action2 = {
      ...mockData.customerActionAddProduct2,
      quantity: 2,
    };
    const promise2 = chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(action2);

    const action3 = {
      ...mockData.customerActionRemoveProduct1,
      quantity: 1,
    };
    const promise3 = chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(action3);

    const action4 = {
      ...mockData.customerActionRemoveProduct2,
      quantity: 1,
    };
    const promise4 = chai
      .request(server)
      .patch(`/basket/${mockData.userId}`)
      .send(action4);

    const [response1, response2, response3, response4] = await Promise.all([
      promise1,
      promise2,
      promise3,
      promise4,
    ]);
    response1.should.have.status(200);
    response2.should.have.status(500);
    response3.should.have.status(400);
    response4.should.have.status(400);
  });
});
