"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initdevices = exports.devicereport = void 0;
function devicereport(context, req, res, org, roles) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Device report data = '${JSON.stringify(context.request.body)}'`);
        return res.status(200).json({
            status: "OK"
        });
    });
}
exports.devicereport = devicereport;
function initdevices(context, req, res, org, roles) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Init devices data = '${JSON.stringify(context.request.body)}'`);
        return res.status(200).json({
            status: "OK"
        });
    });
}
exports.initdevices = initdevices;
