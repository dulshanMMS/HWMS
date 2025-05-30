import React, { PropsWithChildren } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { IOrganizationEntity } from '@novu/shared';
import type { I18NLanguage, ITranslationEntry } from '../../i18n/lang';
import type { IStore, IFetchingStrategy } from '../../shared/interfaces';
import { INotificationCenterStyles } from '../../store/styles';
export declare const queryClient: QueryClient;
export interface INovuProviderProps extends PropsWithChildren<{}> {
    stores?: IStore[];
    backendUrl?: string;
    subscriberId?: string;
    applicationIdentifier: string;
    socketUrl?: string;
    onLoad?: (data: {
        organization: IOrganizationEntity;
    }) => void;
    subscriberHash?: string;
    i18n?: I18NLanguage | ITranslationEntry;
    styles?: INotificationCenterStyles;
    initialFetchingStrategy?: Partial<IFetchingStrategy>;
}
export declare function NovuProvider({ backendUrl: initialBackendUrl, socketUrl: initialSocketUrl, applicationIdentifier, subscriberId, subscriberHash, stores: initialStores, i18n, styles, initialFetchingStrategy, children, onLoad, }: INovuProviderProps): React.JSX.Element;
//# sourceMappingURL=NovuProvider.d.ts.map