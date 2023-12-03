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
const express_1 = __importDefault(require("express"));
const openapi_backend_1 = __importDefault(require("openapi-backend"));
const device_1 = require("./api/device");
const controller_1 = __importDefault(require("./api/controller"));
const organization_1 = __importDefault(require("./model/organization"));
const organization_2 = require("./api/organization");
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const error_1 = __importDefault(require("./model/error"));
const telegraf_1 = require("telegraf");
var npm_package_version = require('../package.json').version;
const api = new openapi_backend_1.default({
    definition: 'shome.yml'
});
api.init();
api.register({
    version: (c, req, res, org, roles) => __awaiter(void 0, void 0, void 0, function* () { return res.status(200).json({ version: npm_package_version }); }),
    devicereport: (c, req, res, org, roles, bot) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, device_1.devicereport)(c, req, res, org, roles, bot); }),
    initcontroller: (c, req, res, org, roles) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, controller_1.default)(c, req, res, org, roles); }),
    initdevices: (c, req, res, org, roles) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, device_1.initdevices)(c, req, res, org, roles); }),
    createorganizationtoken: (c, req, res, org, roles) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, organization_2.createOrganizationToken)(c, req, res, org, roles); }),
    updateorganization: (c, req, res, org, roles) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, organization_2.updateorganization)(c, req, res, org, roles); }),
    changemode: (c, req, res, org, roles, bot) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, organization_2.changemode)(c, req, res, org, roles, bot); }),
    organizationinfo: (c, req, res, org, roles) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, organization_2.organizationinfo)(c, req, res, org, roles); }),
    getlastvalues: (c, req, res, org, roles) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, organization_2.getlastvalues)(c, req, res, org, roles); }),
    //controllerreport: async (c, req, res, org, roles) => await controllerreport(c, req, res),
    validationFail: (c, req, res, org, roles) => __awaiter(void 0, void 0, void 0, function* () { return res.status(400).json({ err: c.validation.errors }); }),
    notFound: (c, req, res, org, roles) => __awaiter(void 0, void 0, void 0, function* () { return res.status(404).json({ c }); }),
    notImplemented: (c, req, res, org, roles) => __awaiter(void 0, void 0, void 0, function* () { return res.status(500).json({ err: 'not implemented' }); }),
    unauthorizedHandler: (c, req, res, org, roles) => __awaiter(void 0, void 0, void 0, function* () { return res.status(401).json({ err: 'not auth' }); })
});
api.registerSecurityHandler('SHOMEAuthOrganizationId', (context, req, res, org) => __awaiter(void 0, void 0, void 0, function* () {
    return org !== undefined;
}));
api.registerSecurityHandler('SHOMEAuthToken', (context, req, res, org) => {
    return true;
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, morgan_1.default)('tiny'));
app.use((0, cors_1.default)());
const PORT = process.env.PORT || 8000;
let tgBot;
if (process.env.tgToken) {
    tgBot = new telegraf_1.Telegraf(process.env.tgToken);
    if (tgBot)
        console.log(`Bot started succeccfully`);
    else
        console.log(`Bot has not started`);
}
app.use((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let org;
    const organizationid = req.headers['shome_organizationid'];
    const authtoken = req.headers['shome_authtoken'];
    console.log(`-----\n✅ [${req.method}:${req.originalUrl}] headers organizationid='${organizationid}'; authtoken='${authtoken}'`);
    try {
        org = yield organization_1.default.getByToken(organizationid, authtoken);
        console.log(`✅ Login successed`);
    }
    catch (e) {
        console.log(`🚫 Login failed`);
        //return res.status(401).json({err: "login failed"})
        org = undefined;
    }
    try {
        return yield api.handleRequest({
            method: req.method,
            path: req.path,
            body: req.body,
            headers: {
                'shome_organizationid': organizationid,
                'shome_authtoken': authtoken
            }
        }, req, res, org === null || org === void 0 ? void 0 : org.organization, org === null || org === void 0 ? void 0 : org.roles, tgBot);
    }
    catch (e) {
        if (e instanceof error_1.default) {
            switch (e.json.code) {
                case "forbidden:roleexpected": return res.status(403).json(e.json);
                default: return res.status(400).json(e.json);
            }
        }
        else {
            return res.status(500).json({ code: "Wrong parameters", description: `Request ${req.url} - ${e.message}` });
            console.log(`🚫 Request ${req.url} - ${e.message}`);
        }
    }
}));
app.listen(PORT, () => console.log(`✅ Now listening on port ${PORT}`));
