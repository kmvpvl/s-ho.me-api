"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = process.env.PORT || 8000;
app.post('/devicereport', (req, res) => {
    console.log(`devicereport: ${JSON.stringify(req.body)}`);
    return res.status(200).json({
        device: "OK"
    });
});
app.post('/initcontroller', (req, res) => {
    console.log(`controller settings: ${JSON.stringify(req.body)}`);
    return res.status(200).json({
        controller: "OK"
    });
});
app.use((req, res, next) => {
    return res.status(404).json({});
});
app.listen(PORT, () => console.log(`Now listening on port ${PORT}`));
