/* eslint-disable @typescript-eslint/no-explicit-any */
import { METHODS } from "./constants";
import { promisePlus } from "../shared/promisePlus";
import { StreamType } from "../types/subscription";
import { InteropAPI, Subscription, Instance, InvocationResult } from "../types/glue";

export class InteropTransport {

    private readonly defaultTransportTimeout: number = 30000;

    constructor(private readonly agm: InteropAPI) { }

    public async initiate(): Promise<void> {

        if (window.glue42gd) {
            await Promise.all(
                Object.values(METHODS).map((method) => this.verifyMethodLive(method.name, method.isStream))
            );
        }

    }

    public async subscribe(streamName: string, streamBranch: string, streamType: StreamType): Promise<Subscription> {

        const subscriptionArgs = {
            branch: streamBranch,
            type: streamType
        };

        let subscription: Subscription;

        try {
            subscription = await this.agm.subscribe(streamName, { arguments: subscriptionArgs });
        } catch (error) {
            const message = `Internal subscription error! Error details: stream - ${streamName}, branch: ${streamBranch}. Internal message: ${error.message}`;
            throw new Error(message);
        }

        return subscription;
    }

    public async transmitControl(operation: string, operationArguments: any, target?: Instance): Promise<any> {
        const invocationArguments = { operation, operationArguments };

        let invocationResult: InvocationResult<any>;
        const baseErrorMessage = `Internal Swimlane Communication Error. Attempted operation: ${JSON.stringify(invocationArguments)}. `;

        // using the 0 index of the errors and values collections, because we expect only one server and
        // this is to safeguard in case in future we decide to deprecate the default returned/message properties in favor of using only collections
        try {
            invocationResult = await this.agm.invoke(METHODS.control.name, invocationArguments, target, { methodResponseTimeoutMs: this.defaultTransportTimeout });

            if (!invocationResult) {
                throw new Error("Received unsupported result from GD - empty result");
            }

            if (!Array.isArray(invocationResult.all_return_values) || invocationResult.all_return_values.length === 0) {
                throw new Error("Received unsupported result from GD - empty values collection");
            }

        } catch (error) {
            if (error && error.all_errors && error.all_errors.length) {

                const invocationErrorMessage = error.all_errors[0].message;
                throw new Error(`${baseErrorMessage} -> Inner message: ${invocationErrorMessage}`);

            }
            throw new Error(`${baseErrorMessage} -> Inner message: ${error.message}`);
        }

        return invocationResult.all_return_values[0].returned;
    }

    private verifyMethodLive(name: string, isStream: boolean): Promise<void> {
        return promisePlus(() => {
            return new Promise((resolve) => {
                const foundMethod = this.agm
                    .methods()
                    .find((method) => method.name === name && method.supportsStreaming === isStream);

                if (foundMethod) {
                    resolve();
                    return;
                }

                let unsubscribe = this.agm.methodAdded((method) => {
                    if (method.name !== name || method.supportsStreaming !== isStream) {
                        return;
                    }

                    if (unsubscribe) {
                        unsubscribe();
                        unsubscribe = null;
                    } else {
                        setTimeout(() => {
                            if (unsubscribe) {
                                unsubscribe();
                            }
                        }, 0);
                    }
                    resolve();
                });
            });
        }, 15000, "Timeout waiting for the Swimlane communication channels");
    }
}
