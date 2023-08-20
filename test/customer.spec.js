const chai = require("chai");
const chaiHttp = require("chai-http");
const connectionManager = require("../connection");
const server = require("../app");

const BasketModel = require("../model/basket");

chai.use(chaiHttp);

describe("Customer Operations - Mongoose", () => {
  const mockData = {
    customerActionAddProduct1: {
      productId: 1,
      action: "add",
      quantity: 1,
      timestamp: Date.now(),
    },
    customerActionAddProduct2: {
      productId: 2,
      action: "add",
      quantity: 2,
      timestamp: Date.now(),
    },
    customerActionRemoveProduct1: {
      productId: 1,
      action: "remove",
      quantity: 1,
      timestamp: Date.now(),
    },
    customerActionRemoveProduct2: {
      productId: 2,
      action: "remove",
      quantity: 2,
      timestamp: Date.now(),
    },
    basket: {
      userId: 1,
      items: [],
    },
  };

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

  it("should add a product to a basket", async () => {
    const response = await chai
      .request(server)
      .patch("/basket")
      .send(mockData.customerActionAddProduct1);
    response.should.have.status(200);
  });

  it("should remove a product from a basket", async () => {
    const response = await chai
      .request(server)
      .patch("/basket")
      .send(mockData.customerActionRemoveProduct1);
    response.should.have.status(200);
  });

  it("should add products to a basket", async () => {
    const response1 = await chai
      .request(server)
      .patch("/basket")
      .send(mockData.customerActionAddProduct1);
    const response2 = await chai
      .request(server)
      .patch("/basket")
      .send(mockData.customerActionAddProduct2);
    response1.should.have.status(200);
    response2.should.have.status(200);
  });

  it("should remove products from a basket", async () => {
    const response1 = await chai
      .request(server)
      .patch("/basket")
      .send(mockData.customerActionRemoveProduct1);
    const response2 = await chai
      .request(server)
      .patch("/basket")
      .send(mockData.customerActionRemoveProduct2);
    response1.should.have.status(200);
    response2.should.have.status(200);
  });

  it("should calculate a receipt of items", async () => {
    const response1 = await chai
      .request(server)
      .patch("/basket")
      .send(mockData.customerActionAddProduct1);
    response1.should.have.status(200);
    const response2 = await chai
      .request(server)
      .patch("/basket")
      .send(mockData.customerActionAddProduct2);
    response2.should.have.status(200);
    const response = await chai.request(server).get(`/basket/${basket.id}`);
    response.should.have.status(200);
  });
});
