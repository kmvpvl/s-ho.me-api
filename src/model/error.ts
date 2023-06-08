export type ErrorCode = 
"client:unknown" 
| "organization:notfound"
| "settings:mongouriundefined"
| "device:notfound"
| "forbidden:roleexpected";

export default class SHOMEError extends Error {
    code: ErrorCode;
    constructor(code:ErrorCode, message?: string) {
        super(`code: ${code} - ${message}`);
        this.code = code;
    }
}