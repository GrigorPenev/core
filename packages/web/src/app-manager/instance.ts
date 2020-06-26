import { Glue42Web } from "../../web";
import { Control } from "../control/control";

export class RemoteInstance implements Glue42Web.AppManager.Instance {
    private WINDOW_DID_NOT_HAVE_TIME_TO_RESPOND = "Peer has left while waiting for result";

    constructor(public id: string, public application: Glue42Web.AppManager.Application, private control: Control, public context: object, public agm: Glue42Web.Interop.Instance) {
    }

    public async stop(): Promise<void> {
        try {
            await this.callControl("stop", {}, false);
        } catch (error) {
            if (error.message !== this.WINDOW_DID_NOT_HAVE_TIME_TO_RESPOND) {
                throw new Error(error);
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private callControl(command: string, args: object, skipResult = false): Promise<Glue42Web.Interop.InvocationResult<any>> {
        return this.control.send(
            { command, domain: "appManager", args, skipResult },
            { instance: this.id });
    }
}
