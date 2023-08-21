const chai = require("chai");
const chaiHttp = require("chai-http");

const connectionManager = require("../connection");
const server = require("../app");
const Utils = require("./utils");

const BasketModel = require("../model/basket");

const { discountDealMockData } = require("./admin.spec");

chai.should();
chai.use(chaiHttp);

// mock data
const mockData = {
  customerActionAddProduct1: {
    action: "add",
    productId: 1,
    timestamp: 1692547131,
  },
  customerActionAddProduct2: {
    action: "add",
    productId: 2,
    timestamp: 1692547132,
  },
  customerActionRemoveProduct1: {
    action: "remove",
    productId: 1,
    timestamp: 1692547133,
  },
  customerActionRemoveProduct2: {
    action: "remove",
    productId: 2,
    timestamp: 1692547134,
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
      .patch("/basket/1")
      .send(action1);
    response1.should.have.status(200);
    const omittedResponse1 = Utils.omitResponse(response1, ["_id", "__v"]);
    omittedResponse1.items[0].productId.should.eql(action1.productId);
    omittedResponse1.items[0].quantity.should.eql(action1.quantity);
    omittedResponse1.items[0].actionTimestamp.should.eql(action1.timestamp);

    const action2 = {
      ...mockData.customerActionAddProduct2,
      quantity: 2,
    };
    const response2 = await chai
      .request(server)
      .patch("/basket/1")
      .send(action2);
    response2.should.have.status(200);
    const omittedResponse2 = Utils.omitResponse(response2, ["_id", "__v"]);
    omittedResponse2.items[0].productId.should.eql(action1.productId);
    omittedResponse2.items[0].quantity.should.eql(action1.quantity);
    omittedResponse2.items[0].actionTimestamp.should.eql(action1.timestamp);
    omittedResponse2.items[1].productId.should.eql(action2.productId);
    omittedResponse2.items[1].quantity.should.eql(action2.quantity);
    omittedResponse2.items[1].actionTimestamp.should.eql(action2.timestamp);

    const action3 = {
      ...mockData.customerActionRemoveProduct1,
      quantity: 1,
    };
    const response3 = await chai
      .request(server)
      .patch("/basket/1")
      .send(action3);
    response3.should.have.status(200);
    const omittedResponse3 = Utils.omitResponse(response3, ["_id", "__v"]);
    console.log(omittedResponse3.items);
    omittedResponse3.items[0].productId.should.eql(action2.productId);
    omittedResponse3.items[0].quantity.should.eql(action2.quantity);
    omittedResponse3.items[0].actionTimestamp.should.eql(action2.timestamp);

    const action4 = {
      ...mockData.customerActionRemoveProduct2,
      quantity: 1,
    };
    const response4 = await chai
      .request(server)
      .patch("/basket/1")
      .send(action4);
    response3.should.have.status(200);
    const omittedResponse4 = Utils.omitResponse(response4, ["_id", "__v"]);
    omittedResponse4.items[0].productId.should.eql(action4.productId);
    omittedResponse4.items[0].quantity.should.eql(
      action2.quantity - action4.quantity
    );
    omittedResponse4.items[0].actionTimestamp.should.eql(action4.timestamp);
  });

  it("should calculate a receipt of items", async () => {
    const action1 = {
      ...mockData.customerActionAddProduct1,
      quantity: 1,
    };
    const response1 = await chai
      .request(server)
      .patch("/basket/1")
      .send(action1);
    response1.should.have.status(200);

    const action2 = {
      ...mockData.customerActionAddProduct2,
      quantity: 3,
    };
    const response2 = await chai
      .request(server)
      .patch("/basket/1")
      .send(action2);
    response2.should.have.status(200);

    const action3 = {
      ...mockData.customerActionRemoveProduct2,
      quantity: 1,
    };
    const response3 = await chai
      .request(server)
      .patch("/basket/1")
      .send(action3);
    response3.should.have.status(200);

    const action4 =
      mockData.applyDiscountDealBuy1Get50percentOffTheSecondForProduct2;
    const response4 = await chai
      .request(server)
      .patch("/basket/1")
      .send(action4);
    response4.should.have.status(200);
    const omittedResponse4 = Utils.omitResponse(response4, ["_id", "__v"]);
    omittedResponse4.items[0].productId.should.eql(action3.productId);
    omittedResponse4.items[0].quantity.should.eql(
      action2.quantity - action3.quantity
    );
    omittedResponse4.items[0].actionTimestamp.should.eql(action3.timestamp);
    omittedResponse4.appliedDiscountDealId.actionTimestamp.should.eql(
      action4.discountDealId
    );

    const receiptResponse = await chai
      .request(server)
      .get(`/receipt/${response4._id}`);
    receiptResponse.should.have.status(200);
    receiptResponse.body.should.eql({
      purchasedItems: omittedResponse4.body.items,
      appliedDiscountDeal:
        discountDealMockData.discountDealBuy1Get50percentOffTheSecondForProduct2,
      totalPrice: 2 * 200,
    });
  });

  // advanced tests
  //// error tests

  //// concurrency tests
});
