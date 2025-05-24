import { UseMutationOptions } from '@tanstack/react-query';
import type { IMessage } from '@novu/shared';
interface IRemoveAllNotificationsVariables {
    feedId?: string;
}
export declare const useRemoveAllNotifications: ({ onSuccess, ...options }?: {
    onSuccess?: () => void;
} & UseMutationOptions<IMessage, Error, IRemoveAllNotificationsVariables, unknown>) => {
    removeAllNotifications: import("@tanstack/react-query").UseMutateFunction<IMessage, Error, IRemoveAllNotificationsVariables, unknown>;
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
    variables: IRemoveAllNotificationsVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage, Error, IRemoveAllNotificationsVariables, unknown>;
} | {
    removeAllNotifications: import("@tanstack/react-query").UseMutateFunction<IMessage, Error, IRemoveAllNotificationsVariables, unknown>;
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
    variables: IRemoveAllNotificationsVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage, Error, IRemoveAllNotificationsVariables, unknown>;
} | {
    removeAllNotifications: import("@tanstack/react-query").UseMutateFunction<IMessage, Error, IRemoveAllNotificationsVariables, unknown>;
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
    variables: IRemoveAllNotificationsVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage, Error, IRemoveAllNotificationsVariables, unknown>;
} | {
    removeAllNotifications: import("@tanstack/react-query").UseMutateFunction<IMessage, Error, IRemoveAllNotificationsVariables, unknown>;
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
    variables: IRemoveAllNotificationsVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage, Error, IRemoveAllNotificationsVariables, unknown>;
};
export {};
//# sourceMappingURL=useRemoveAllNotifications.d.ts.map