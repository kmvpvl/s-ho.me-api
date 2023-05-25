"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const error_1 = __importDefault(require("./error"));
let settings;
const removeJSONComments = (json) => {
    return json.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
};
try {
    let strSettings = fs_1.default.readFileSync("settings.json", "utf-8");
    settings = JSON.parse(removeJSONComments(strSettings));
}
catch (err) {
    // if settings.json not found, trying to use process.ENV variables
    if (!process.env.mongouri) {
        throw new error_1.default("settings:mongouriundefined");
    }
    else {
        settings = {
            mongouri: process.env.mongouri,
            tgToken: process.env.tgtoken,
        };
    }
}
exports.default = settings;
