import { UseMutationOptions } from '@tanstack/react-query';
import type { IUserPreferenceSettings } from '@novu/client';
interface IUpdateUserPreferencesVariables {
    templateId: string;
    channelType: string;
    checked: boolean;
}
export declare const useUpdateUserPreferences: ({ onSuccess, onError, ...options }?: UseMutationOptions<IUserPreferenceSettings, Error, IUpdateUserPreferencesVariables>) => {
    updateUserPreferences: (variables: IUpdateUserPreferencesVariables) => void;
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
    variables: IUpdateUserPreferencesVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IUserPreferenceSettings, Error, IUpdateUserPreferencesVariables, unknown>;
} | {
    updateUserPreferences: (variables: IUpdateUserPreferencesVariables) => void;
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
    variables: IUpdateUserPreferencesVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IUserPreferenceSettings, Error, IUpdateUserPreferencesVariables, unknown>;
} | {
    updateUserPreferences: (variables: IUpdateUserPreferencesVariables) => void;
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
    variables: IUpdateUserPreferencesVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IUserPreferenceSettings, Error, IUpdateUserPreferencesVariables, unknown>;
} | {
    updateUserPreferences: (variables: IUpdateUserPreferencesVariables) => void;
    data: IUserPreferenceSettings;
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
    variables: IUpdateUserPreferencesVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IUserPreferenceSettings, Error, IUpdateUserPreferencesVariables, unknown>;
};
export {};
//# sourceMappingURL=useUpdateUserPreferences.d.ts.map