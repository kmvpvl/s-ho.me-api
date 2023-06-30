import { Schema, Types, model } from "mongoose";
import MongoProto from "./mongoproto";
import { UUID } from "crypto";
import { Md5 } from "ts-md5";
import SHOMEError from "./error";
import { v4 } from "uuid";
import { IDevice, mongoDevices } from "./device";

export type SHOMERoles = "admin" | "controller";

export interface IOrganizationToken {
    authTokenHash: string;
    roles: Array<SHOMERoles>
}
export interface IOrganization {
    _id?: Types.ObjectId;
    id: string;
    tokens: Array<IOrganizationToken>;
    created: Date;
    changed?: Date;
}

export const TokenSchema = new Schema({
    authTokenHash: {type: String, required: true},
    roles: {type: [String], required: true, enum:["admin", "controller"]}
});

export const OrganizationSchema = new Schema({
    id: {type: String, required: true},
    tokens: {
        type: [TokenSchema],
        required: true
    },
    created: {type: Date, required: true, default: Date.now},
    changed: {type: Date, required: true, default: Date.now}
});

export const mongoOrganizations = model<IOrganization>('organizations', OrganizationSchema);

export default class Organization extends MongoProto<IOrganization> {
    constructor(id?: Types.ObjectId, data?: IOrganization) {
        super(mongoOrganizations, id, data);
    }
    public static async getByToken(name: string, token: UUID): Promise<{organization: Organization, roles: Array<SHOMERoles>}> {
        MongoProto.connectMongo();
        const hash = Md5.hashStr(`${name} ${token}`);
        const o = await mongoOrganizations.aggregate([
            {"$match": {"tokens.authTokenHash": hash}}
        ]);
        if (1 !== o.length) throw new SHOMEError("organization:notfound", `name='${name}'; token='${token}'`);
        const org = new Organization(undefined, o[0]);
        await org.load();
        const roles = org.json?.tokens.filter(el=>el.authTokenHash==hash)[0].roles as SHOMERoles[];
        return {organization: org, roles: roles};
    }
    public static async createOrganization(name: string): Promise<{organizationid: Types.ObjectId; admintoken: UUID}> {
        const token = v4() as UUID;
        const hash = Md5.hashStr(`${name} ${token}`);
        const iOrg: IOrganization = {
            id: name,
            tokens: [
                {
                    authTokenHash: hash,
                    roles: ['admin']
                }
            ],
            created: new Date
        }
        const org = new Organization(undefined, iOrg);
        await org.save();
        const ret = {
            organizationid: org.uid, 
            admintoken: token
        };
        return ret;
    }

    public async createToken(roles: Array<SHOMERoles>): Promise<UUID> {
        await this.checkData();
        const token = v4() as UUID;
        const hash = Md5.hashStr(`${this.json?.id} ${token}`);
        this.data?.tokens.push({authTokenHash: hash, roles:roles});
        await this.save();
        return token;
    }

    public static hasRole(rolesToSearch: SHOMERoles, rolesAssigned: Array<SHOMERoles>): boolean {
        // implementing 'admin has any role'
        if (rolesAssigned.includes("admin")) return true;

        return  rolesAssigned.includes(rolesToSearch);
    }
    public async devices(): Promise<IDevice[]> {
        const d = await mongoDevices.aggregate([{
            $match: {"organizationid": this.data?.id}
        }]);
        return d;
    }

    public async devicesWithLastValues(deviceListIds: string[]): Promise<IDevice[]>  {
        const d = await mongoDevices.aggregate([
            {
              '$match': {
                'id': {
                  '$in': deviceListIds
                }, 
                'organizationid': this.data?.id
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
    }
}