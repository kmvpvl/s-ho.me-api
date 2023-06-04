import { Schema, Types, model } from "mongoose";
import MongoProto from "./mongoproto";

export interface IController {
    _id?: Types.ObjectId;
    organizationid: string;
    name: string; 
    description: string; 
    autoupdate: {
        auto: boolean;
        repo?: string;
        branch?: string;
    },
    location?: object;
    buffer?: {
        
    };
    logs?: object;
    layers?: [{
        sortNumber: number;
        bgImage?: string;
        id: string;
        name: string;
    }];
    rules?:[]
}

const ControllerAutoUpdateSchema = new Schema({
    auto: {type: Boolean, required: true},
    repo: {type: String, required: false},
    branch: {type: String, required: false}
});

const ControllerLayerSchema = new Schema({
    sortNumber: {type: Number, required: true},
    bgImage: {type: String, required: false},
    id: {type: String, required: true},
    name: {type: String, required: true}
});

export const ControllerSchema = new Schema({
    organizationid: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    autoupdate: {type: ControllerAutoUpdateSchema, required: true},
    location: {type: Object, required: false},
    buffer: {type: Object, required: false},
    logs: {type: Object, required: false},
    layers: {type: [ControllerLayerSchema], required: false},
    rules: {type: [Object], required: false}
});

const mongoControllers = model<IController>('controllers', ControllerSchema);

export default class Controller extends MongoProto<IController> {
    constructor (id?: Types.ObjectId, data?: IController) {
        super(mongoControllers, id, data);
    }
    public static async getByName(orgid: string, name: string): Promise<Controller | undefined> {
        const c = await mongoControllers.aggregate([
            {"$match": {
                name: name
            }}
        ]);
        if (c.length === 1) return new Controller(undefined, c[0]);
    }
    public static async createController(ctrl: IController): Promise<Controller> {
        const c = await Controller.getByName(ctrl.organizationid, ctrl.name);
        if (c) return c;
        const newC = new Controller(undefined, ctrl);
        await newC.save();
        return newC;
    }
}