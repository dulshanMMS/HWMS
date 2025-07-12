import { UseMutationOptions } from '@tanstack/react-query';
import type { IMessage } from '@novu/shared';
interface IRemoveNotificationVariables {
    messageId: string;
}
export declare const useRemoveNotification: ({ onSuccess, ...options }?: {
    onSuccess?: () => void;
} & UseMutationOptions<IMessage, Error, IRemoveNotificationVariables, unknown>) => {
    removeNotification: import("@tanstack/react-query").UseMutateFunction<IMessage, Error, IRemoveNotificationVariables, unknown>;
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
    variables: IRemoveNotificationVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage, Error, IRemoveNotificationVariables, unknown>;
} | {
    removeNotification: import("@tanstack/react-query").UseMutateFunction<IMessage, Error, IRemoveNotificationVariables, unknown>;
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
    variables: IRemoveNotificationVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage, Error, IRemoveNotificationVariables, unknown>;
} | {
    removeNotification: import("@tanstack/react-query").UseMutateFunction<IMessage, Error, IRemoveNotificationVariables, unknown>;
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
    variables: IRemoveNotificationVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage, Error, IRemoveNotificationVariables, unknown>;
} | {
    removeNotification: import("@tanstack/react-query").UseMutateFunction<IMessage, Error, IRemoveNotificationVariables, unknown>;
    data: IMessage;
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
    variables: IRemoveNotificationVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage, Error, IRemoveNotificationVariables, unknown>;
};
export {};
//# sourceMappingURL=useRemoveNotification.d.ts.map