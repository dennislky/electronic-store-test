// helper function
const omitResponse = (response, fields) => {
  if (fields && fields.length !== 0) {
    fields.forEach((field) => delete response.body[field]);
  }
  return response;
};

module.exports = {
  omitResponse,
};
