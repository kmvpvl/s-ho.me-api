"use strict";
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
}
exports.default = Controller;
