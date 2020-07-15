import { Npm } from "../initiate/npm";
import { join } from "path";
import { readFile, writeFile, constants, access, copyFile } from "fs";
import { workspacesDeps, workspacesDefaults, glueDevConfigDefaults } from "../defaults";
import { CliConfig, FullDevConfig } from "../config/cli.config";
import { Logger } from "log4js";

export class WorkspacesController {
    constructor(private readonly npm: Npm) { }

    public async processWorkspacesCommand(config: CliConfig, logger: Logger, argv: string[]): Promise<void> {
        const workspacesCommand = argv[3];

        if (workspacesCommand === "init") {
            await this.start(config, logger);
            return;
        }
    }

    public async start(config: CliConfig, logger: Logger): Promise<void> {
        const configExists = await this.checkConfigExists(config);

        if (!configExists) {
            throw new Error("Glue42 Core must be initiated before workspaces can be added. Please run gluec init and then try again");
        }

        logger.info(`Installing Glue42 Core Workspaces deps: ${workspacesDeps.join(" ")}`);
        await this.npm.installDeps(workspacesDeps);

        await this.copyManifest(config);
        logger.info(`Workspaces manifest ready at: ${join(config.rootDirectory, "workspaces.webmanifest")}`);

        await this.decorateDevConfig(config);
        logger.info("The Glue42 Core dev config was decorated, workspaces is initialized.");
    }

    private async decorateDevConfig(config: CliConfig): Promise<void> {
        const defaults = workspacesDefaults;
        const configLocation = join(config.rootDirectory, glueDevConfigDefaults.name);

        const devConfig = await this.read(configLocation);
        devConfig.glueAssets.workspaces = defaults;

        await this.write(configLocation, devConfig);
    }

    private read(location: string): Promise<FullDevConfig> {
        return new Promise((resolve, reject) => {
            readFile(location, "utf8", (err, data) => {
                if (err) {
                    return reject(err);
                }

                resolve(JSON.parse(data));
            });
        });
    }

    private async write(location: string, data: FullDevConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            writeFile(location, JSON.stringify(data), (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }

    private checkConfigExists(config: CliConfig): Promise<boolean> {
        return new Promise<boolean>((resolve) => {

            const configLocation = join(config.rootDirectory, glueDevConfigDefaults.name);

            access(configLocation, constants.F_OK, (err) => {
                if (err) {
                    return resolve(false);
                }
                resolve(true);
            });
        });
    }

    private async copyManifest(config: CliConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            const source = join(config.rootDirectory, "node_modules", "@glue42", "workspaces-app", "manifest.webmanifest");
            const destination = join(config.rootDirectory, "workspaces.webmanifest");
    
            copyFile(source, destination, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }
}
