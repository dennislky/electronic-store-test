const chai = require("chai");
const chaiHttp = require("chai-http");
const connectionManager = require("../connection");
const server = require("../app");

const ProductModel = require("../model/product");
const DiscountDealModel = require("../model/discountDeal");

chai.use(chaiHttp);

describe("Admin User Operations - Mongoose", () => {
  const mockData = {
    productNormal1: {
      productName: "productNormal1",
      price: 100,
    },
    productNormal2: {
      productName: "productNormal2",
      price: 200,
    },
    productNameAbnormal: {
      productName: "select * from product",
      price: 300,
    },
    productPriceAbnormal: {
      productName: "productPriceAbnormal",
      price: -1,
    },
    productMissingProductName: {
      price: -1,
    },
    productMissingPrice: {
      productName: "productPriceAbnormal",
    },
    discountDealNormal: {},
  };

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

  it("should create a new product", async () => {
    const response = await chai
      .request(server)
      .post("/product")
      .send(mockData.productNormal1);
    response.should.have.status(201);
    delete response.body.id;
    response.body.should.eql(mockData.productNormal1);
  });

  it("should remove a product", async () => {
    const product = await chai
      .request(server)
      .post("/product")
      .send(mockData.productNormal1);
    const response = await chai
      .request(server)
      .delete(`/product/${product.id}`)
      .send(mockData.productNormal1);
    response.should.have.status(200);
  });

  it("should add discount deals for products", async () => {
    const product1 = await chai
      .request(server)
      .post("/product")
      .send(mockData.productNormal1);
    const product2 = await chai
      .request(server)
      .post("/product")
      .send(mockData.productNormal2);
    const discountDeal = await chai
      .request(server)
      .post("/discountDeal")
      .send(mockData.discountDealNormal);
    discountDeal.should.have.status(201);
  });
});
