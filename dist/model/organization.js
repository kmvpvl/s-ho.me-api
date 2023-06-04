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
exports.mongoOrganizations = exports.OrganizationSchema = exports.TokenSchema = void 0;
const mongoose_1 = require("mongoose");
const mongoproto_1 = __importDefault(require("./mongoproto"));
const ts_md5_1 = require("ts-md5");
const error_1 = __importDefault(require("./error"));
const uuid_1 = require("uuid");
exports.TokenSchema = new mongoose_1.Schema({
    authTokenHash: { type: String, required: true },
    roles: { type: [String], required: true, enum: ["admin", "controller"] }
});
exports.OrganizationSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    tokens: {
        type: [exports.TokenSchema],
        required: true
    },
    created: { type: Date, required: true, default: Date.now },
    changed: { type: Date, required: true, default: Date.now }
});
exports.mongoOrganizations = (0, mongoose_1.model)('organizations', exports.OrganizationSchema);
class Organization extends mongoproto_1.default {
    constructor(id, data) {
        super(exports.mongoOrganizations, id, data);
    }
    static getByToken(name, token) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            mongoproto_1.default.connectMongo();
            const hash = ts_md5_1.Md5.hashStr(`${name} ${token}`);
            const o = yield exports.mongoOrganizations.aggregate([
                { "$match": { "tokens.authTokenHash": hash } }
            ]);
            if (1 !== o.length)
                throw new error_1.default("organization:notfound", `name='${name}'; token='${token}'`);
            const org = new Organization(undefined, o[0]);
            yield org.load();
            const roles = (_a = org.json) === null || _a === void 0 ? void 0 : _a.tokens.filter(el => el.authTokenHash == hash)[0].roles;
            return { organization: org, roles: roles };
        });
    }
    static createOrganization(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = (0, uuid_1.v4)();
            const hash = ts_md5_1.Md5.hashStr(`${name} ${token}`);
            const iOrg = {
                id: name,
                tokens: [
                    {
                        authTokenHash: hash,
                        roles: ['admin']
                    }
                ],
                created: new Date
            };
            const org = new Organization(undefined, iOrg);
            yield org.save();
            const ret = {
                organizationid: org.uid,
                admintoken: token
            };
            return ret;
        });
    }
    createToken(roles) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            const token = (0, uuid_1.v4)();
            const hash = ts_md5_1.Md5.hashStr(`${(_a = this.json) === null || _a === void 0 ? void 0 : _a.id} ${token}`);
            (_b = this.data) === null || _b === void 0 ? void 0 : _b.tokens.push({ authTokenHash: hash, roles: roles });
            yield this.save();
            return token;
        });
    }
    static hasRole(rolesToSearch, rolesAssigned) {
        // implementing 'admin has any role'
        if (rolesAssigned.includes("admin"))
            return true;
        return rolesAssigned.includes(rolesToSearch);
    }
}
exports.default = Organization;
