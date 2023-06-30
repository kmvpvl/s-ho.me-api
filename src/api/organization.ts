import { UUID } from "crypto";
import { Types } from "mongoose";
import { v4 } from "uuid";
import Organization, { IOrganization } from "../model/organization";
import { Md5 } from "ts-md5";
import { SHOMERoles } from "../model/organization";
import { Request, Response } from 'express';
import { Context} from "openapi-backend";
import SHOMEError from "../model/error";


export async function createOrganizationToken(cntx: Context, req: Request, res: Response, org: Organization, roles: SHOMERoles[]){
    const r = cntx.request.body.roles;
    console.log(`roles='${r}'`);
    if (Organization.hasRole('admin', roles)) {
        const ret = await org.createToken(r);
        return res.status(200).json(ret);
    } else {
        throw new SHOMEError("forbidden:roleexpected", `Admin role expected`);
    }
}

export async function organizationinfo(cntx: Context, req: Request, res: Response, org: Organization, roles: SHOMERoles[]){
    console.log(`roles='${roles}'`);

    return res.status(200).json({
        org: org.json,
        devices: await org.devices()
    });
}

export async function getlastvalues(cntx: Context, req: Request, res: Response, org: Organization, roles: SHOMERoles[]){
    console.log(`roles='${roles}'`);
    const arr = req.body;

    return res.status(200).json(await org.devicesWithLastValues(arr));
}
