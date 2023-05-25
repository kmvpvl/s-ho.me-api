import { Request, Response } from 'express';
import {Context} from "openapi-backend";
import Organization, { SHOMERoles } from '../model/organization';

export default async function initcontroller(context: Context, req:Request, res: Response, org: Organization, roles: SHOMERoles[]) {
    console.log(`controller settings: client='${req.headers["shome_auth"]}'; body='${JSON.stringify(req.body)}'`);
    return res.status(200).json({
        controller: "OK"
    });
} 