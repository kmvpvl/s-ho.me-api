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
exports.ControllerSchema = void 0;
const mongoose_1 = require("mongoose");
const mongoproto_1 = __importDefault(require("./mongoproto"));
const ControllerAutoUpdateSchema = new mongoose_1.Schema({
    auto: { type: Boolean, required: true },
    repo: { type: String, required: false },
    branch: { type: String, required: false }
});
const ControllerLayerSchema = new mongoose_1.Schema({
    sortNumber: { type: Number, required: true },
    bgImage: { type: String, required: false },
    id: { type: String, required: true },
    name: { type: String, required: true }
});
exports.ControllerSchema = new mongoose_1.Schema({
    organizationid: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    autoupdate: { type: ControllerAutoUpdateSchema, required: true },
    location: { type: Object, required: false },
    buffer: { type: Object, required: false },
    logs: { type: Object, required: false },
    layers: { type: [ControllerLayerSchema], required: false },
    rules: { type: [Object], required: false }
});
const mongoControllers = (0, mongoose_1.model)('controllers', exports.ControllerSchema);
class Controller extends mongoproto_1.default {
    constructor(id, data) {
        super(mongoControllers, id, data);
    }
    static getByName(orgid, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const c = yield mongoControllers.aggregate([
                { "$match": {
                        name: name
                    } }
            ]);
            if (c.length === 1)
                return new Controller(undefined, c[0]);
        });
    }
    static createController(ctrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const c = yield Controller.getByName(ctrl.organizationid, ctrl.name);
            if (c)
                return c;
            const newC = new Controller(undefined, ctrl);
            yield newC.save();
            return newC;
        });
    }
}
exports.default = Controller;
