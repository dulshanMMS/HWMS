export interface ITranslationEntry {
    readonly translations: {
        readonly notifications: string;
        readonly markAllAsRead: string;
        readonly poweredBy: string;
        readonly settings: string;
    };
    readonly lang: string;
}
export declare const TRANSLATIONS: Record<I18NLanguage, ITranslationEntry['translations']>;
export type I18NLanguage = 'en';
//# sourceMappingURL=lang.d.ts.map