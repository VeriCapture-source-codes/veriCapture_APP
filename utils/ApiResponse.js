class ApiResponse {
    constructor(statusCode, message = 'success', data) {
        this.statusCode = statusCode;
        this.status = statusCode < 400;
        this.data = data;
        this.message = message;
        this.success = success;
    }
}

export default ApiResponse;