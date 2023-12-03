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
exports.changemode = exports.getlastvalues = exports.updateorganization = exports.organizationinfo = exports.createOrganizationToken = void 0;
const organization_1 = __importDefault(require("../model/organization"));
const error_1 = __importDefault(require("../model/error"));
function createOrganizationToken(cntx, req, res, org, roles) {
    return __awaiter(this, void 0, void 0, function* () {
        const r = cntx.request.body.roles;
        console.log(`roles='${r}'`);
        if (organization_1.default.hasRole('admin', roles)) {
            const ret = yield org.createToken(r);
            return res.status(200).json(ret);
        }
        else {
            throw new error_1.default("forbidden:roleexpected", `Admin role expected`);
        }
    });
}
exports.createOrganizationToken = createOrganizationToken;
function organizationinfo(cntx, req, res, org, roles) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`roles='${roles}'`);
        return res.status(200).json({
            org: org.json,
            devices: yield org.devices()
        });
    });
}
exports.organizationinfo = organizationinfo;
function updateorganization(cntx, req, res, org, roles) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`roles='${roles}'`);
        const modes = cntx.request.body.modes;
        const rules = cntx.request.body.rules;
        const id = cntx.request.body.id;
        if (organization_1.default.hasRole('admin', roles)) {
            yield org.update(id, modes, rules);
            return res.status(200).json(org.json);
        }
        else {
            throw new error_1.default("forbidden:roleexpected", `Admin role expected`);
        }
    });
}
exports.updateorganization = updateorganization;
function getlastvalues(cntx, req, res, org, roles) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`roles='${roles}'`);
        const arr = req.body;
        return res.status(200).json(yield org.devicesWithLastValues(arr));
    });
}
exports.getlastvalues = getlastvalues;
function changemode(cntx, req, res, org, roles, bot) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`roles='${roles}'`);
        console.log(`mode='${req.body.mode}'`);
        if (organization_1.default.hasRole('user', roles)) {
            try {
                yield org.changemode(req.body.mode);
                org.checkRules(bot);
                return res.status(200).json();
            }
            catch (e) {
                return res.status(400).json(e.json);
            }
        }
        else {
            throw new error_1.default("forbidden:roleexpected", `Admin role expected`);
        }
    });
}
exports.changemode = changemode;
