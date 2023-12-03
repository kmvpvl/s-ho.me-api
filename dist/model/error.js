"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SHOMEError extends Error {
    constructor(code, message) {
        super(`${message}`);
        this.code = code;
    }
    get json() {
        return {
            code: this.code,
            message: this.message
        };
    }
}
exports.default = SHOMEError;
