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
exports.initdevices = exports.devicereport = void 0;
const organization_1 = __importDefault(require("../model/organization"));
const error_1 = __importDefault(require("../model/error"));
const device_1 = require("../model/device");
function devicereport(context, req, res, org, roles) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Device report data = '${JSON.stringify(context.request.body)}'`);
        if (!organization_1.default.hasRole('controller', roles))
            throw new error_1.default("forbidden:roleexpected", `Role 'controller' was expected`);
        const ddr = req.body;
        const timestamp = new Date(ddr.timestamp);
        const devices_ret = [];
        for (const i in ddr.devices) {
            const idr = ddr.devices[i];
            idr.organizationid = (_a = org.json) === null || _a === void 0 ? void 0 : _a.id;
            idr.ip = req.ip;
            idr.timestamp = timestamp;
            idr.created = new Date();
            const dr = new device_1.DeviceReport(undefined, idr);
            yield dr.save();
            const device = yield device_1.Device.getByName(idr.organizationid, idr.id);
            if (device)
                devices_ret.push(device.json);
        }
        return res.status(200).json(devices_ret);
    });
}
exports.devicereport = devicereport;
function initdevices(context, req, res, org, roles) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Init devices data = '${JSON.stringify(context.request.body)}'`);
        if (!organization_1.default.hasRole('controller', roles))
            throw new error_1.default("forbidden:roleexpected", `Role 'controller' was expected`);
        const idd = req.body;
        const idd_ret = [];
        for (const i in idd) {
            const id = idd[i];
            id.organizationid = (_a = org.json) === null || _a === void 0 ? void 0 : _a.id;
            const d = yield device_1.Device.createDevice(id);
            idd_ret.push(d.json);
        }
        return res.status(200).json(idd_ret);
    });
}
exports.initdevices = initdevices;
