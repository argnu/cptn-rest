class CustomError {
  constructor(code, msg) {
    this.message = msg;
    this.code = code;
  }
}

module.exports.CustomError = CustomError;
