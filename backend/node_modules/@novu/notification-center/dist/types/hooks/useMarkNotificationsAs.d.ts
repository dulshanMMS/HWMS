import { UseMutationOptions } from '@tanstack/react-query';
import type { IMessage } from '@novu/shared';
import { IStoreQuery } from '@novu/client';
import type { IMessageId } from '../shared/interfaces';
interface IMarkNotificationsAsVariables {
    messageId: IMessageId;
    seen: boolean;
    read: boolean;
}
export declare const useMarkNotificationsAs: ({ onSuccess, query, ...options }?: {
    onSuccess?: () => void;
    query?: IStoreQuery;
} & UseMutationOptions<IMessage[], Error, IMarkNotificationsAsVariables, unknown>) => {
    markNotificationsAs: import("@tanstack/react-query").UseMutateFunction<IMessage[], Error, IMarkNotificationsAsVariables, unknown>;
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
    variables: IMarkNotificationsAsVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage[], Error, IMarkNotificationsAsVariables, unknown>;
} | {
    markNotificationsAs: import("@tanstack/react-query").UseMutateFunction<IMessage[], Error, IMarkNotificationsAsVariables, unknown>;
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
    variables: IMarkNotificationsAsVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage[], Error, IMarkNotificationsAsVariables, unknown>;
} | {
    markNotificationsAs: import("@tanstack/react-query").UseMutateFunction<IMessage[], Error, IMarkNotificationsAsVariables, unknown>;
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
    variables: IMarkNotificationsAsVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage[], Error, IMarkNotificationsAsVariables, unknown>;
} | {
    markNotificationsAs: import("@tanstack/react-query").UseMutateFunction<IMessage[], Error, IMarkNotificationsAsVariables, unknown>;
    data: IMessage[];
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
    variables: IMarkNotificationsAsVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage[], Error, IMarkNotificationsAsVariables, unknown>;
};
export {};
//# sourceMappingURL=useMarkNotificationsAs.d.ts.map