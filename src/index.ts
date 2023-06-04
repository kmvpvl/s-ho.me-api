import express from "express";
import OpenAPIBackend from "openapi-backend";
import { devicereport, initdevices } from "./api/device";
import initcontroller from "./api/controller";
import Organization from "./model/organization";
import { UUID } from "crypto";
import { createOrganizationToken } from "./api/organization";
import cors from 'cors';
import morgan from "morgan";
import SHOMEError from "./model/error";

const api = new OpenAPIBackend({ 
    definition: 'shome.yml'
});

api.init();

function checkSecurity(c: any): boolean {
    try{
        //const user = new User(c.request);
        return true; 
    } catch(e){
        return false;
    }
}

api.register({
    version:    async (c, req, res, org, roles) => {return res.status(200).json({version: process.env.npm_package_version})},
    devicereport: async (c, req, res, org, roles) => await devicereport(c, req, res, org, roles),
    initcontroller: async (c, req, res, org, roles) => await initcontroller(c, req, res, org, roles),
    initdevices: async (c, req, res, org, roles) => await initdevices(c, req, res, org, roles),
    createorganizationtoken: async (c, req, res, org, roles) => await createOrganizationToken(c, req, res, org, roles),
    //controllerreport: async (c, req, res, org, roles) => await controllerreport(c, req, res),
    validationFail: async (c, req, res, org, roles) => res.status(400).json({ err: c.validation.errors }),
    notFound: async (c, req, res, org, roles) => res.status(404).json({c}),
    notImplemented: async (c, req, res, org, roles) => res.status(500).json({ err: 'not implemented' }),
    unauthorizedHandler: async (c, req, res, org, roles) => res.status(401).json({ err: 'not auth' })
});
api.registerSecurityHandler('SHOMEAuthOrganizationId', async (context, req, res, org)=> {
    return org !== undefined;
});

api.registerSecurityHandler('SHOMEAuthToken',  (context, req, res)=> {
    return true;
});

const app = express();
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());

const PORT = process.env.PORT || 8000;

app.use(async (req, res) => {
    let org;
    const organizationid = req.headers['shome_organizationid'] as string;
    const authtoken = req.headers['shome_authtoken'] as UUID;
    console.log(`-----\n✅ [${req.method}:${req.originalUrl}] headers organizationid='${organizationid}'; authtoken='${authtoken}'`);
    try {
        org = await Organization.getByToken(organizationid, authtoken);
        console.log(`✅ Login successed`);
    } catch (e) {
        console.log(`🚫 Login failed`);
        //return res.status(401).json({err: "login failed"})
        org = undefined;
    }
    try {
        return await api.handleRequest({
            method: req.method,
            path: req.path,
            body: req.body,
            headers: {
                'shome_organizationid': organizationid,
                'shome_authtoken': authtoken
            }
        }, req, res, org?.organization, org?.roles);
    } 
    catch (e) {
        if (e instanceof SHOMEError) {
            switch ((e as SHOMEError).code) {
                case "forbidden:roleexpected": return res.status(403).json({
                    code: (e as SHOMEError).code,
                    message: e.message
                });
                default: return res.status(400).json({
                    code: (e as SHOMEError).code,
                    message: e.message
                });
            }
        } else {
            return res.status(500).json({code: "Wrong parameters", description: `Request ${req.url} - ${(e as Error).message}`});
            console.log(`🚫 Request ${req.url} - ${(e as Error).message}`);
        }
    }
});

app.listen(PORT, ()=>console.log(`✅ Now listening on port ${PORT}`));
