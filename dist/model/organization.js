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
const device_1 = require("./device");
const ModeSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    disabled: { type: Boolean, required: true },
    rules: { type: Array, required: true },
    created: { type: Date, required: true, default: Date.now },
    changed: { type: Date, required: false, default: Date.now },
});
const EventDataDeviceSchema = new mongoose_1.Schema({
    deviceid: { type: String, required: true },
    range: { type: String, required: true },
    repeat: { type: Number, required: true },
});
const EventDataTimeSchema = new mongoose_1.Schema({});
const EventSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    device: { type: EventDataDeviceSchema, required: false },
    time: { type: EventDataTimeSchema, required: false },
});
const ChangeModeReportSchema = new mongoose_1.Schema({
    organizationid: { type: String, required: true },
    mode: { type: String, required: true },
    created: { type: Date, required: true, default: Date.now },
});
/*export interface IEventReport {
    organizationid: string;
    eventname: string;
    timestamp: Date;
    data: IEventData;
    created: Date;
    changed?: Date;
}*/
const EventReportSchema = new mongoose_1.Schema({
    organizationid: { type: String, required: true },
    eventname: { type: String, required: true },
    timestamp: { type: Date, required: true },
    data: { type: { oneOf: [EventDataDeviceSchema, EventDataTimeSchema] }, required: true },
    created: { type: Date, required: true, default: Date.now },
    changed: { type: Date, required: true, default: Date.now }
});
//const mongoEventReports = model<IEventReport>('eventreports', EventReportSchema);
const mongoChangeModeReports = (0, mongoose_1.model)('changemodereports', ChangeModeReportSchema);
const ActionDeviceDataSchema = new mongoose_1.Schema({});
const ActionNotifyDataSchema = new mongoose_1.Schema({
    tguser: { type: Number, required: true }
});
const ActionSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    device: { type: ActionDeviceDataSchema, required: false },
    notify: { type: ActionNotifyDataSchema, required: false },
});
const RuleSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    events: { type: [
            Object({
                operation: { type: String, required: false, enum: ["NOT", "AND", "OR"] },
                event: { type: EventSchema, required: true }
            })
        ] },
    actions: { type: [ActionSchema], required: true },
    disabled: { type: Boolean, required: true },
    created: { type: Date, required: true, default: Date.now },
    changed: { type: Date, required: true, default: Date.now }
});
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
    modes: { type: [ModeSchema], required: false },
    rules: { type: [RuleSchema], required: false },
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
    devices() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const d = yield device_1.mongoDevices.aggregate([{
                    $match: { "organizationid": (_a = this.data) === null || _a === void 0 ? void 0 : _a.id }
                }]);
            return d;
        });
    }
    update(id, modes, rules) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkData();
            if (this.data) {
                if (id !== undefined)
                    this.data.id = id;
                if (modes !== undefined)
                    this.data.modes = modes;
                if (rules !== undefined)
                    this.data.rules = rules;
                yield this.save();
                yield this.load();
            }
        });
    }
    changemode(newmode) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            this.checkData();
            if (!((_b = (_a = this.data) === null || _a === void 0 ? void 0 : _a.modes) === null || _b === void 0 ? void 0 : _b.find(v => v.name == newmode)))
                throw new error_1.default("organozation:modenotfound", `Org = '${(_c = this.data) === null || _c === void 0 ? void 0 : _c.id}' has no mode = '${newmode}'`);
            const d = yield mongoChangeModeReports.insertMany([{
                    organizationid: (_d = this.data) === null || _d === void 0 ? void 0 : _d.id,
                    mode: newmode
                }]);
            console.log(`Organization: '${this.data.id}' changed mode to '${newmode}'`);
        });
    }
    getMode() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.checkData();
            const lm = yield mongoChangeModeReports.aggregate([
                {
                    '$match': {
                        'organizationid': (_a = this.data) === null || _a === void 0 ? void 0 : _a.id
                    }
                }, {
                    '$sort': {
                        'created': -1
                    }
                }, {
                    '$limit': 1
                }
            ]);
            if (lm.length === 1)
                return lm[0].mode;
        });
    }
    checkRules(bot) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            this.checkData();
            console.log(`Organization: '${(_a = this.data) === null || _a === void 0 ? void 0 : _a.id}' check rules procedure started`);
            if (this.data === undefined || this.data.rules === undefined || this.data.modes === undefined)
                return;
            //calculating current mode of Ogr
            const cur_mode = yield this.getMode();
            if (cur_mode === undefined)
                return;
            const mode_obj = this.data.modes.find(m => m.name === cur_mode);
            if (mode_obj === undefined)
                return;
            console.log(`Organization: '${(_b = this.data) === null || _b === void 0 ? void 0 : _b.id}' check rules procedure all checks passed`);
            // enumeration all rules of mode
            for (const rule_id of mode_obj.rules) {
                const rule = this.data.rules.find(r => r.name === rule_id);
                if (rule === undefined)
                    break;
                console.log(`Organization: '${(_c = this.data) === null || _c === void 0 ? void 0 : _c.id}' checking rule: '${rule === null || rule === void 0 ? void 0 : rule.description}'`);
                //enumeration all events of rule
                for (const ev_obj of rule.events) {
                    if (ev_obj.event.device) {
                        const lv = yield this.devicesWithLastValues([ev_obj.event.device.deviceid]);
                        if (lv.length === 1) {
                            const device = new device_1.Device(undefined, lv[0]);
                            const range = device.getRange(lv[0].value);
                            if (range === ev_obj.event.device.range) {
                                // device event triggered
                                for (const action of rule.actions) {
                                    if (((_d = action.notify) === null || _d === void 0 ? void 0 : _d.tguser) !== undefined) {
                                        //notify by TG
                                        console.log(`Organization: '${(_e = this.data) === null || _e === void 0 ? void 0 : _e.id}' need to inform: 🏠${this.data.id} ⚡${rule.description}\n📟${(_f = device.json) === null || _f === void 0 ? void 0 : _f.name} 📐${range} ⚖️${lv[0].value}`);
                                        bot === null || bot === void 0 ? void 0 : bot.telegram.sendMessage((_g = action.notify) === null || _g === void 0 ? void 0 : _g.tguser, `🏠${this.data.id} ⚡${rule.description}\n📟${(_h = device.json) === null || _h === void 0 ? void 0 : _h.name} 📐${range} ⚖️${lv[0].value}`);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
    devicesWithLastValues(deviceListIds) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const d = yield device_1.mongoDevices.aggregate([
                {
                    '$match': {
                        'id': {
                            '$in': deviceListIds
                        },
                        'organizationid': (_a = this.data) === null || _a === void 0 ? void 0 : _a.id
                    }
                }, {
                    '$lookup': {
                        'from': 'devicereports',
                        'localField': 'id',
                        'foreignField': 'id',
                        'pipeline': [
                            {
                                '$group': {
                                    '_id': '$id',
                                    'value': {
                                        '$last': '$value'
                                    },
                                    'value_str': {
                                        '$last': '$value_str'
                                    },
                                    'timestamp': {
                                        '$last': '$timestamp'
                                    }
                                }
                            }
                        ],
                        'as': 'result'
                    }
                }, {
                    '$project': {
                        'result._id': 0
                    }
                }, {
                    '$unwind': '$result'
                }, {
                    '$addFields': {
                        'value': '$result.value',
                        'value_str': '$result.value_str',
                        'timestamp': '$result.timestamp'
                    }
                }
            ]);
            return d;
        });
    }
}
exports.default = Organization;
