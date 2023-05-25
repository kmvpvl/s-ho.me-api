export type ErrorCode = 
"client:unknown" 
| "organization:notfound"
| "settings:mongouriundefined";

export default class SHOMEError extends Error {
    constructor(code:ErrorCode, message?: string) {
        super(`code: ${code} - ${message}`);
    }
}