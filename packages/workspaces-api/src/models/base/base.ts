import { Workspace } from "../workspace";
import { ParentBuilder } from "../../builders/parentBuilder";
import { strictParentDefinitionDecoder, swimlaneWindowDefinitionDecoder, checkThrowCallback } from "../../shared/decoders";
import { SubParent, AllParentTypes, Child, SubParentTypes, AllParent } from "../../types/builders";
import { PrivateDataManager } from "../../shared/privateDataManager";
import { ParentPrivateData, WorkspacePrivateData } from "../../types/privateData";
import { Window } from "../../models/window";
import { Frame, WorkspaceWindowDefinition, WorkspaceWindow, ParentDefinition } from "../../../workspaces";

interface PrivateData {
    manager: PrivateDataManager;
}

const data = new WeakMap<Base, PrivateData>();

const getData = (base: Base, model: AllParentTypes): WorkspacePrivateData | ParentPrivateData => {
    const manager = data.get(base).manager;

    if (model instanceof Workspace) {
        return manager.getWorkspaceData(model);
    }

    return data.get(base).manager.getParentData(model);
};

const getWindowFromPlacementId = (base: Base, placemenId: string): Window => {
    const manager = data.get(base).manager;

    return manager.getWindowByPlacementId(placemenId);
};

export class Base {
    public frameId: string;
    public workspaceId: string;
    public positionIndex: number;

    constructor(dataManager: PrivateDataManager) {
        data.set(this, { manager: dataManager });
    }

    public getId(model: AllParentTypes): string {
        return getData(this, model).id;
    }

    public getPositionIndex(model: AllParentTypes): number {
        return getData(this, model).config.positionIndex;
    }

    public getWorkspaceId(model: AllParentTypes): string {
        const privateData = getData(this, model) as ParentPrivateData;
        return privateData.config.workspaceId || privateData.workspace.id;
    }

    public getFrameId(model: AllParentTypes): string {
        return getData(this, model).frame.id;
    }

    public getChild(model: AllParentTypes, predicate: (child: Child) => boolean): Child {
        checkThrowCallback(predicate);
        const children = getData(this, model).children;

        return children.find(predicate);
    }

    public getAllChildren(model: AllParentTypes, predicate?: (child: Child) => boolean): Child[] {
        checkThrowCallback(predicate, true);
        const children = getData(this, model).children;

        if (typeof predicate === "undefined") {
            return children;
        }

        return children.filter(predicate);
    }

    public getMyParent(model: AllParentTypes): AllParentTypes {
        if (model instanceof Workspace) {
            return;
        }
        return (getData(this, model) as ParentPrivateData).parent;
    }

    public getMyFrame(model: AllParentTypes): Frame {
        return getData(this, model).frame;
    }

    public getMyWorkspace(model: AllParentTypes): Workspace {
        if (model instanceof Workspace) {
            return;
        }
        return (getData(this, model) as ParentPrivateData).workspace;
    }

    public async addWindow(model: AllParentTypes, definition: WorkspaceWindowDefinition, parentType: AllParent): Promise<WorkspaceWindow> {
        if (!definition.appName && !definition.windowId) {
            throw new Error("The window definition should contain either an appName or a windowId");
        }

        const validatedDefinition = swimlaneWindowDefinitionDecoder.runWithException(definition);
        const controller = getData(this, model).controller;

        const operationResult = await controller.add("window", getData(this, model).id, parentType, validatedDefinition);
        // tslint:disable-next-line: no-console
        console.log("add window operation reuslt", operationResult);

        if (model instanceof Workspace) {
            await model.refreshReference();
            return getWindowFromPlacementId(this, operationResult.itemId);
        }

        await this.getMyWorkspace(model).refreshReference();

        return getWindowFromPlacementId(this, operationResult.itemId);
    }

    public async addParent<T>(model: AllParentTypes, typeToAdd: SubParent, parentType: AllParent, definition?: ParentDefinition | ParentBuilder): Promise<T> {
        const parentDefinition = this.transformDefinition(typeToAdd, definition);
        const controller = getData(this, model).controller;

        const newParentId = (await controller.add("container", getData(this, model).id, parentType, parentDefinition)).itemId;

        if (model instanceof Workspace) {
            await model.refreshReference();
            return model.getParent((parent) => parent.id === newParentId) as unknown as T;
        }

        const myWorkspace = this.getMyWorkspace(model);
        await myWorkspace.refreshReference();

        return myWorkspace.getParent((parent) => parent.id === newParentId) as unknown as T;
    }

    public async removeChild(model: AllParentTypes, predicate: (child: Child) => boolean): Promise<void> {
        checkThrowCallback(predicate);
        const child = this.getChild(model, predicate);
        if (!child) {
            return;
        }

        // tslint:disable-next-line: no-console
        console.log("will close child");
        await child.close();

        if (model instanceof Workspace) {
            // tslint:disable-next-line: no-console
            console.log("will get reference 1", model.getAllChildren());

            await model.refreshReference();
            // tslint:disable-next-line: no-console
            console.log("allchildren", model.getAllChildren());
            return;
        }

        // tslint:disable-next-line: no-console
        console.log("will get reference", model.getAllChildren());

        await this.getMyWorkspace(model).refreshReference();

        // tslint:disable-next-line: no-console
        console.log("allchildren", model.getAllChildren());
    }

    public async maximize(model: AllParentTypes): Promise<void> {
        const controller = getData(this, model).controller;

        await controller.maximizeItem(getData(this, model).id);
    }

    public async restore(model: AllParentTypes): Promise<void> {
        const controller = getData(this, model).controller;

        await controller.restoreItem(getData(this, model).id);
    }

    public async close(model: SubParentTypes): Promise<void> {
        const modelData = getData(this, model) as ParentPrivateData;

        const controller = getData(this, model).controller;

        await controller.closeItem(modelData.id);

        if (modelData.parent instanceof Workspace) {
            await modelData.parent.refreshReference();
            // tslint:disable-next-line: no-console
            console.log("workspace reference refreshed", modelData.parent.getAllChildren());
        } else {
            await this.getMyWorkspace(modelData.parent).refreshReference();
            // tslint:disable-next-line: no-console
            console.log(" reference refreshed", modelData.parent.getAllChildren());
        }

        // await modelData
        //     .parent
        //     .removeChild((child) => child.id === modelData.id);
    }

    private transformDefinition(type: "group" | "row" | "column", definition?: ParentDefinition | ParentBuilder): ParentDefinition {
        let parentDefinition: ParentDefinition;

        if (typeof definition === "undefined") {
            parentDefinition = { type, children: [] };
        } else if (definition instanceof ParentBuilder) {
            parentDefinition = definition.serialize();
        } else {
            if (typeof definition.type === "undefined") {
                definition.type = type;
            }
            parentDefinition = strictParentDefinitionDecoder.runWithException(definition);
            parentDefinition.children = parentDefinition.children || [];
        }

        return parentDefinition;
    }
}
