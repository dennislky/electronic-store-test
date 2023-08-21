// helper function
const omitResponse = (response, fields) => {
  return fields.reduce((obj, field) => {
    const { [field]: omit, ...rest } = obj;
    return rest;
  }, response.body);
};

module.exports = {
  omitResponse,
};
