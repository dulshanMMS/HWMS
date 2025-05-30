import { UseMutationOptions } from '@tanstack/react-query';
import { IMessage, ButtonTypeEnum, MessageActionStatusEnum } from '@novu/shared';
interface IUpdateActionVariables {
    messageId: string;
    actionButtonType: ButtonTypeEnum;
    status: MessageActionStatusEnum;
    payload?: Record<string, unknown>;
}
export declare const useUpdateAction: ({ onSuccess, ...options }?: {
    onSuccess?: () => void;
} & UseMutationOptions<IMessage, Error, IUpdateActionVariables, unknown>) => {
    updateAction: import("@tanstack/react-query").UseMutateFunction<IMessage, Error, IUpdateActionVariables, unknown>;
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
    variables: IUpdateActionVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage, Error, IUpdateActionVariables, unknown>;
} | {
    updateAction: import("@tanstack/react-query").UseMutateFunction<IMessage, Error, IUpdateActionVariables, unknown>;
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
    variables: IUpdateActionVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage, Error, IUpdateActionVariables, unknown>;
} | {
    updateAction: import("@tanstack/react-query").UseMutateFunction<IMessage, Error, IUpdateActionVariables, unknown>;
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
    variables: IUpdateActionVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage, Error, IUpdateActionVariables, unknown>;
} | {
    updateAction: import("@tanstack/react-query").UseMutateFunction<IMessage, Error, IUpdateActionVariables, unknown>;
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
    variables: IUpdateActionVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IMessage, Error, IUpdateActionVariables, unknown>;
};
export {};
//# sourceMappingURL=useUpdateAction.d.ts.map