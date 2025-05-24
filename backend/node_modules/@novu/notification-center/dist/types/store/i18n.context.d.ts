import React from 'react';
import { I18NLanguage, ITranslationEntry } from '../i18n/lang';
export declare const I18NContext: React.Context<ITranslationEntry>;
interface INovuI18NProviderProps {
    i18n?: I18NLanguage | ITranslationEntry;
    children: JSX.Element;
}
export declare function NovuI18NProvider({ i18n, ...props }: INovuI18NProviderProps): React.JSX.Element;
export {};
//# sourceMappingURL=i18n.context.d.ts.map