import {merge} from "lodash";
import {AppSettings} from "./appsettings";
import {DevAppSettings} from "./appsettings.development";
import {TestAppSettings} from "./appsettings.test";

const devEnvName = "development";
const testEnvName = "test";

const env = process.env.NODE_ENV || devEnvName;

export const isDevEnv = env === devEnvName;
export const isTestsEnv = env === testEnvName;

function getConfig() {
    switch (env) {
        case devEnvName:
            return merge(AppSettings, DevAppSettings);

        case testEnvName:
            return merge(AppSettings, TestAppSettings);

        default:
            return AppSettings;
    }
}

export const config = getConfig();
