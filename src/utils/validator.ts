
const validateFields = (value:any, fieldName:string, type:string, statusCode = 400) => {
  if (value === undefined || value === null || value === "") {
    throw {
      message: `${fieldName} is missing!`,
      statusCode
    };
  }

  if (type && typeof value !== type) {
    throw {
      message: `${fieldName} has invalid data type. Expected ${type}.`,
      statusCode
    };
  }
};

export default validateFields;