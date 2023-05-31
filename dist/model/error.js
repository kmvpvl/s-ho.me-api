"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SHOMEError extends Error {
    constructor(code, message) {
        super(`code: ${code} - ${message}`);
        this.code = code;
    }
}
exports.default = SHOMEError;
