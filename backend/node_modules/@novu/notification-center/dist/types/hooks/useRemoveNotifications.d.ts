import { UseMutationOptions } from '@tanstack/react-query';
interface IRemoveNotificationsVariables {
    messageIds: string[];
}
export type ResponseDataType = Record<string, never>;
export declare const useRemoveNotifications: ({ onSuccess, ...options }?: {
    onSuccess?: () => void;
} & UseMutationOptions<ResponseDataType, Error, IRemoveNotificationsVariables, unknown>) => {
    removeNotifications: import("@tanstack/react-query").UseMutateFunction<ResponseDataType, Error, IRemoveNotificationsVariables, unknown>;
    data: undefined;
    error: null;
    isError: false;
    isIdle: true;
    isLoading: false;
    isSuccess: false;
    status: "idle";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: Error;
    isPaused: boolean;
    variables: IRemoveNotificationsVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<ResponseDataType, Error, IRemoveNotificationsVariables, unknown>;
} | {
    removeNotifications: import("@tanstack/react-query").UseMutateFunction<ResponseDataType, Error, IRemoveNotificationsVariables, unknown>;
    data: undefined;
    error: null;
    isError: false;
    isIdle: false;
    isLoading: true;
    isSuccess: false;
    status: "loading";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: Error;
    isPaused: boolean;
    variables: IRemoveNotificationsVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<ResponseDataType, Error, IRemoveNotificationsVariables, unknown>;
} | {
    removeNotifications: import("@tanstack/react-query").UseMutateFunction<ResponseDataType, Error, IRemoveNotificationsVariables, unknown>;
    data: undefined;
    error: Error;
    isError: true;
    isIdle: false;
    isLoading: false;
    isSuccess: false;
    status: "error";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: Error;
    isPaused: boolean;
    variables: IRemoveNotificationsVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<ResponseDataType, Error, IRemoveNotificationsVariables, unknown>;
} | {
    removeNotifications: import("@tanstack/react-query").UseMutateFunction<ResponseDataType, Error, IRemoveNotificationsVariables, unknown>;
    data: ResponseDataType;
    error: null;
    isError: false;
    isIdle: false;
    isLoading: false;
    isSuccess: true;
    status: "success";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: Error;
    isPaused: boolean;
    variables: IRemoveNotificationsVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<ResponseDataType, Error, IRemoveNotificationsVariables, unknown>;
};
export {};
//# sourceMappingURL=useRemoveNotifications.d.ts.map