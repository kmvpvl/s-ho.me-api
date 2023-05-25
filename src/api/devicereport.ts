import { Request, Response } from 'express';
import {Context} from "openapi-backend";
import { v4 } from 'uuid';
import Organization, { SHOMERoles } from '../model/organization';
import { Types } from 'mongoose';
import SHOMEError from '../model/error';

export default async function devicereport(context: Context, req:Request, res: Response, org: Organization, roles: SHOMERoles[]) {
    console.log(`Device report data = '${JSON.stringify(context.request.body)}'`);
    return res.status(200).json({
        status: "OK"
    });
} 

