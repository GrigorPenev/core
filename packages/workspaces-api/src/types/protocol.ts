/* eslint-disable @typescript-eslint/no-explicit-any */
import { Decoder } from "decoder-validate";
import { WorkspaceLayout, WorkspaceDefinition, RestoreWorkspaceConfig, WorkspaceWindowDefinition, ParentDefinition, WorkspaceCreateConfig } from "../../workspaces";

export interface StreamOperation {
    name: string;
    payloadDecoder: Decoder<any>;
}

export interface ControlOperation {
    name: string;
    resultDecoder: Decoder<any>;
    argsDecoder?: Decoder<any>;
}

// #region incoming
export interface IsWindowInSwimlaneResult {
    inWorkspace: boolean;
}

export interface WorkspaceConfigResult {
    frameId: string;
    title: string;
    name: string;
    positionIndex: number;
}

export interface BaseChildSnapshotConfig {
    frameId: string;
    workspaceId: string;
    positionIndex: number;
}

export interface ParentSnapshotConfig extends BaseChildSnapshotConfig {
    type?: "window" | "row" | "column" | "group"; // this just a place-holder until there are real parent-specific configs
}

export interface SwimlaneWindowSnapshotConfig extends BaseChildSnapshotConfig {
    windowId?: string;
    isMaximized: boolean;
    isLoaded: boolean;
    isFocused: boolean;
    title?: string;
}

export interface ChildSnapshotResult {
    id: string;
    type: "window" | "row" | "column" | "group";
    children?: ChildSnapshotResult[];
    config: ParentSnapshotConfig | SwimlaneWindowSnapshotConfig;
}

export interface FrameSnapshotResult {
    id: string;
    config: any;
    workspaces: WorkspaceSnapshotResult[];
}

export interface FrameSummaryResult {
    id: string;
}

export interface FrameSummariesResult {
    summaries: FrameSummaryResult[];
}

export interface WorkspaceSnapshotResult {
    id: string;
    config: WorkspaceConfigResult;
    children: ChildSnapshotResult[];
    frameSummary: FrameSummaryResult;
}

export interface WorkspaceSummaryResult {
    id: string;
    config: WorkspaceConfigResult;
}

export interface WorkspaceSummariesResult {
    summaries: WorkspaceSummaryResult[];
}

export interface LayoutSummary {
    name: string;
}

export interface LayoutSummariesResult {
    summaries: LayoutSummary[];
}

export interface ContainerSummaryResult {
    itemId: string;
    config: ParentSnapshotConfig;
}

export interface ExportedLayoutsResult {
    layouts: WorkspaceLayout[];
}

export interface SimpleWindowOperationSuccessResult {
    windowId: string;
}

export interface AddItemResult {
    itemId: string;
    windowId?: string;
}

// #endregion

// #region outgoing

export interface WorkspaceCreateConfigProtocol extends WorkspaceDefinition {
    saveConfig: WorkspaceCreateConfig;
}

export interface GetFrameSummaryConfig {
    itemId: string;
}

export interface OpenWorkspaceConfig {
    name: string;
    options?: RestoreWorkspaceConfig;
}

export interface DeleteLayoutConfig {
    name: string;
}

export interface SimpleItemConfig {
    itemId: string;
}

export interface ResizeItemConfig {
    itemId: string;
    width?: number;
    height?: number;
    relative?: boolean;
}

export interface MoveFrameConfig {
    itemId: string;
    top?: number;
    left?: number;
    relative?: boolean;
}

export interface SetItemTitleConfig {
    itemId: string;
    title: string;
}

export interface MoveWindowConfig {
    itemId: string;
    containerId: string;
}

export interface AddWindowConfig {
    definition: WorkspaceWindowDefinition;
    parentId: string;
    parentType: "row" | "column" | "group" | "workspace";
}

export interface AddContainerConfig {
    definition: ParentDefinition;
    parentId: string;
    parentType: "row" | "column" | "group" | "workspace";
}

export interface BundleConfig {
    type: "row" | "column";
    workspaceId: string;
}
// #endregion

// #region stream incoming
export interface FrameStreamData {
    frameSummary: FrameSummaryResult;
}

export interface WorkspaceStreamData {
    workspaceSummary: WorkspaceSummaryResult;
    frameSummary: FrameSummaryResult;
}

export interface ContainerStreamData {
    containerSummary: ContainerSummaryResult;
}

export interface WindowStreamData {
    windowSummary: {
        itemId: string;
        parentId: string;
        config: SwimlaneWindowSnapshotConfig;
    };
}
// #endregion
