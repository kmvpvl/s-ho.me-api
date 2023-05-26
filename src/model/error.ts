export type ErrorCode = 
"client:unknown" 
| "organization:notfound"
| "settings:mongouriundefined"
| "device:notfound";

export default class SHOMEError extends Error {
    constructor(code:ErrorCode, message?: string) {
        super(`code: ${code} - ${message}`);
    }
}