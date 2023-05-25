import fs from 'fs';
import SHOMEError from './error';
export type SHOMESettings = {
    mongouri: string;
    tgToken?: string;
};

let settings: SHOMESettings;
const removeJSONComments = (json: string) => {
    return json.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
}

try {
    let strSettings = fs.readFileSync("settings.json", "utf-8");
    settings = JSON.parse(removeJSONComments(strSettings));
} catch (err: any) {
    // if settings.json not found, trying to use process.ENV variables
    if (!process.env.mongouri) {
        throw new SHOMEError("settings:mongouriundefined")
    } else {
        settings = {
            mongouri: process.env.mongouri,
            tgToken: process.env.tgtoken,
        }
    }
}

export default settings;
