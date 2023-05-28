import { Schema, Types, model } from "mongoose";
import MongoProto from "./mongoproto";
import SHOMEError from "./error";

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

const DeviceLocationSchema = new Schema({
    layer: {type: String, required: true},
    x: {type: Number, required: false},
    y: {type: Number, required: false}
});
const DeviceValueRangeSchema = new Schema({
    name: {type: String, required: true},
    color: {type: String, required: false},
    min: {type: Number, required: false},
    max: {type: Number, required: false}
});

export const DeviceSchema = new Schema({
    organizationid: {type: String, required: true},
    id: {type: String, required: true},
    name: {type: String, required: true},
    type: {type: String, required: true},
    units: {type: String, required: false},
    hardware: {type: String, required: true},
    pin: {type: Number, required: true},
    emulation: {type: Boolean, required: false},
    freqRead: {type: Number, required: true},
    freqReport: {type: Number, required: true},
    threshold: {type: Number, required: false},
    precision: {type: Number, required: false},
    reportOnValueChanged: {type: Boolean, required: true},
    reportOnInit: {type: Boolean, required: false},
    location: {type: DeviceLocationSchema, required: true},
    ranges: {type: [DeviceValueRangeSchema], required: false},
    created: {type: Date, required: true},
    changed: {type: Date, required: false}
});

const mongoDeviceReport = model<IDeviceReport>('devicereports', DeviceReportSchema);
const mongoDevices = model<IDevice>('devices', DeviceSchema);

export interface IDevice {
    _id?: Types.ObjectId;
    organizationid?: string;
    id: string;
    name: string;
    type: string;
    units?: string;
    hardware: string;
    pin: number;
    emulation?: boolean;
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
    created: Date;
    changed?: Date;
}

export class DeviceReport extends MongoProto<IDeviceReport> {
    constructor(id?: Types.ObjectId, data?: IDeviceReport) {
        super(mongoDeviceReport, id, data);
    }
}

export class Device extends MongoProto<IDevice> {
    constructor(id?: Types.ObjectId, data?: IDevice) {
        super(mongoDevices, id, data);
    }
    public static async getDeviceByName(name: string): Promise<Device> {
        const d = await mongoDevices.aggregate([
            {$match: {id: name}}
        ]);
        if (d.length === 1) return d[0];
        throw new SHOMEError("device:notfound", `id='${name}'`);
    }
    public static async createDevice(device: IDevice): Promise<Device> {
        const d = Device.getDeviceByName(device.id);
        if (d) return d;
        const newD = new Device(undefined, device);
        await newD.save();
        return newD;
    }
}
