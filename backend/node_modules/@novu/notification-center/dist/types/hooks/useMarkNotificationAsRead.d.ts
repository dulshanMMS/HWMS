import { UseMutationOptions } from '@tanstack/react-query';
interface IMarkNotificationsAsReadVariables {
    feedId?: string | string[];
}
export declare const useMarkNotificationsAsRead: ({ onSuccess, ...options }?: {
    onSuccess?: () => void;
} & UseMutationOptions<number, Error, IMarkNotificationsAsReadVariables, unknown>) => {
    markNotificationsAsRead: import("@tanstack/react-query").UseMutateFunction<number, Error, IMarkNotificationsAsReadVariables, unknown>;
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
    variables: IMarkNotificationsAsReadVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<number, Error, IMarkNotificationsAsReadVariables, unknown>;
} | {
    markNotificationsAsRead: import("@tanstack/react-query").UseMutateFunction<number, Error, IMarkNotificationsAsReadVariables, unknown>;
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
    variables: IMarkNotificationsAsReadVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<number, Error, IMarkNotificationsAsReadVariables, unknown>;
} | {
    markNotificationsAsRead: import("@tanstack/react-query").UseMutateFunction<number, Error, IMarkNotificationsAsReadVariables, unknown>;
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
    variables: IMarkNotificationsAsReadVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<number, Error, IMarkNotificationsAsReadVariables, unknown>;
} | {
    markNotificationsAsRead: import("@tanstack/react-query").UseMutateFunction<number, Error, IMarkNotificationsAsReadVariables, unknown>;
    data: number;
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
    variables: IMarkNotificationsAsReadVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<number, Error, IMarkNotificationsAsReadVariables, unknown>;
};
export {};
//# sourceMappingURL=useMarkNotificationAsRead.d.ts.map