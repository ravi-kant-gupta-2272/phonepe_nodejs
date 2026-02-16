class AppError extends Error {
  statusCode: number;
  status: string;

  constructor(message: string, statusCode: number) {
    super(message); 
    console.log(this.message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export default  AppError;
