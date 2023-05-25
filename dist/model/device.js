"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceReport = exports.DeviceReportSchema = void 0;
const mongoose_1 = require("mongoose");
const mongoproto_1 = __importDefault(require("./mongoproto"));
exports.DeviceReportSchema = new mongoose_1.Schema({
    created: { type: Date, required: true },
    ip: { type: String, required: false },
    value: { type: Number, required: true },
    strvalue: { type: String, required: false },
    extra: { type: Object, required: false },
    organizationid: { type: String, required: true },
    deviceid: { type: String, required: true }
});
const mongoDeviceReport = (0, mongoose_1.model)('devicereports', exports.DeviceReportSchema);
class DeviceReport extends mongoproto_1.default {
    constructor(id, data) {
        super(mongoDeviceReport, id, data);
    }
}
exports.DeviceReport = DeviceReport;
