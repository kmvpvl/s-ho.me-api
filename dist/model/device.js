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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = exports.DeviceReport = exports.DeviceSchema = exports.DeviceReportSchema = void 0;
const mongoose_1 = require("mongoose");
const mongoproto_1 = __importDefault(require("./mongoproto"));
const error_1 = __importDefault(require("./error"));
exports.DeviceReportSchema = new mongoose_1.Schema({
    created: { type: Date, required: true },
    ip: { type: String, required: false },
    value: { type: Number, required: true },
    strvalue: { type: String, required: false },
    extra: { type: Object, required: false },
    organizationid: { type: String, required: true },
    deviceid: { type: String, required: true }
});
const DeviceLocationSchema = new mongoose_1.Schema({
    layer: { type: String, required: true },
    x: { type: Number, required: false },
    y: { type: Number, required: false }
});
const DeviceValueRangeSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    color: { type: String, required: false },
    min: { type: Number, required: false },
    max: { type: Number, required: false }
});
exports.DeviceSchema = new mongoose_1.Schema({
    organizationid: { type: String, required: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    units: { type: String, required: false },
    hardware: { type: String, required: true },
    pin: { type: Number, required: true },
    emulation: { type: Boolean, required: false },
    freqRead: { type: Number, required: true },
    freqReport: { type: Number, required: true },
    threshold: { type: Number, required: false },
    precision: { type: Number, required: false },
    reportOnValueChanged: { type: Boolean, required: true },
    reportOnInit: { type: Boolean, required: false },
    location: { type: DeviceLocationSchema, required: true },
    ranges: { type: [DeviceValueRangeSchema], required: false },
    created: { type: Date, required: true },
    changed: { type: Date, required: false }
});
const mongoDeviceReport = (0, mongoose_1.model)('devicereports', exports.DeviceReportSchema);
const mongoDevices = (0, mongoose_1.model)('devices', exports.DeviceSchema);
class DeviceReport extends mongoproto_1.default {
    constructor(id, data) {
        super(mongoDeviceReport, id, data);
    }
}
exports.DeviceReport = DeviceReport;
class Device extends mongoproto_1.default {
    constructor(id, data) {
        super(mongoDevices, id, data);
    }
    static getDeviceByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const d = yield mongoDevices.aggregate([
                { $match: { id: name } }
            ]);
            if (d.length === 1)
                return d[0];
            throw new error_1.default("device:notfound", `id='${name}'`);
        });
    }
}
exports.Device = Device;
