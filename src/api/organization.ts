import { UUID } from "crypto";
import { Types } from "mongoose";
import { v4 } from "uuid";
import Organization, { IOrganization } from "../model/organization";
import { Md5 } from "ts-md5";
import { SHOMERoles } from "../model/organization";
import { Request, Response } from 'express';
import { Context} from "openapi-backend";


export async function createOrganizationToken(cntx: Context, req: Request, res: Response, org: Organization, roles: SHOMERoles[]){
    const r = cntx.request.body.roles;
    console.log(`roles='${r}'`);
    const ret = await org.createToken(r);
    return res.status(200).json(ret);
}