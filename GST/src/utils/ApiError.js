class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = this.mapStatusCode(statusCode);
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;
        this.stack = stack;
    }
    mapStatusCode(code) {
        const firebaseErrorMap = {
            "auth/user-not-found": 404,
            "auth/email-already-exists": 409,
            "auth/invalid-email": 400,
            "auth/invalid-phone-number": 400,
            "auth/wrong-password": 401,
            "auth/user-disabled": 403,
            "auth/too-many-requests": 429,
            "auth/internal-error": 500,
        };
        return firebaseErrorMap[code] || (typeof code === 'number' ? code : 500);
    }
}
export default ApiError;
