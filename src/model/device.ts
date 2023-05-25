import { Schema, Types, model } from "mongoose";
import MongoProto from "./mongoproto";

export interface IDeviceReport {
    _id?: Types.ObjectId;
    created: Date;
    ip: string;
    value: number;
    strvalue: string;
    extra?: object;
    organizationid: string;    
    deviceid: string;
}

export const DeviceReportSchema = new Schema({
    created: {type: Date, required: true},
    ip: {type: String, required: false},
    value: {type: Number, required: true},
    strvalue: {type: String, required: false},
    extra: {type: Object, required: false},
    organizationid: {type: String, required: true},
    deviceid: {type: String, required: true}
});

const mongoDeviceReport = model<IDeviceReport>('devicereports', DeviceReportSchema);

export interface IDevice {
    _id?: Types.ObjectId;
    id: string;
    name: string;
    type: string;
    units?: string;
    hardware: string;
    pin: number;
    emulation: boolean;
    freqRead: number;
    freqReport: number;
    threshold?: number;
    precision?: number;
    reportOnValueChanged: boolean;
    reportOnInit?: boolean;
    location: {
        layer: string;
        x?: number;
        y?: number;
    }
    ranges?: Array<{
        name: string;
        color: string;
        max?: number;
        min?: number;
    }>;
}

export class DeviceReport extends MongoProto<IDeviceReport> {
    constructor(id?: Types.ObjectId, data?: IDeviceReport) {
        super(mongoDeviceReport, id, data);
    }
}
