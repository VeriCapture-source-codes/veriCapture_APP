export const globalError = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
      message: err.message || 'Internal Server Error'
    });
}


export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error)=> next(error))
    }
}

export class ApiError extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;

    }
}

