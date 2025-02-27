export const globalError = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'fail';
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message
    })
}


export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error)=> next(error))
    }
}


export const ApiErrors = () => {
    class ApiError extends Error{
        constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
            super(message);
            this.statusCode = statusCode;
            // this.status = statusCode < 400;
            this.errors = errors;
            this.success = false;
            this.data = null;
            if (stack) {
                this.stack = stack
            } else {
                Error.captureStackTrace(this, this.constructor)
            }
        }
    }
}
