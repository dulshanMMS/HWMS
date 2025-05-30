import type { IUserGlobalPreferenceSettings } from '@novu/client';
import { UseMutationOptions } from '@tanstack/react-query';
interface IUpdateUserGlobalPreferencesVariables {
    preferences: {
        channelType: string;
        enabled: boolean;
    }[];
    enabled?: boolean;
}
export declare const useUpdateUserGlobalPreferences: ({ onSuccess, onError, ...options }?: UseMutationOptions<IUserGlobalPreferenceSettings, Error, IUpdateUserGlobalPreferencesVariables>) => {
    updateUserGlobalPreferences: (variables: IUpdateUserGlobalPreferencesVariables) => void;
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
    variables: IUpdateUserGlobalPreferencesVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IUserGlobalPreferenceSettings, Error, IUpdateUserGlobalPreferencesVariables, unknown>;
} | {
    updateUserGlobalPreferences: (variables: IUpdateUserGlobalPreferencesVariables) => void;
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
    variables: IUpdateUserGlobalPreferencesVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IUserGlobalPreferenceSettings, Error, IUpdateUserGlobalPreferencesVariables, unknown>;
} | {
    updateUserGlobalPreferences: (variables: IUpdateUserGlobalPreferencesVariables) => void;
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
    variables: IUpdateUserGlobalPreferencesVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IUserGlobalPreferenceSettings, Error, IUpdateUserGlobalPreferencesVariables, unknown>;
} | {
    updateUserGlobalPreferences: (variables: IUpdateUserGlobalPreferencesVariables) => void;
    data: IUserGlobalPreferenceSettings;
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
    variables: IUpdateUserGlobalPreferencesVariables;
    mutateAsync: import("@tanstack/react-query").UseMutateAsyncFunction<IUserGlobalPreferenceSettings, Error, IUpdateUserGlobalPreferencesVariables, unknown>;
};
export {};
//# sourceMappingURL=useUpdateUserGlobalPreferences.d.ts.map