export interface ControlArgs {
    operation: string;
    params: any;
}

export interface CancellablePromise<T> extends Promise<T> {
    cancel: () => void;
}