export interface ITranslationContent {
    readonly notifications: string;
    readonly markAllAsRead: string;
    readonly poweredBy: string;
    readonly settings: string;
    readonly removeMessage: string;
    readonly markAsRead: string;
    readonly markAsUnRead: string;
    readonly noNewNotification: string;
}
export interface ITranslationEntry {
    readonly translations: Partial<ITranslationContent>;
    readonly lang: string;
}
export declare const TRANSLATIONS: Record<I18NLanguage, ITranslationEntry>;
/**
 * Should use the short notations of the W3C internationalization document
 * https://www.science.co.il/language/Codes.php
 *
 * For example:
 * - For English use "en"
 * - For French use "fr"
 *
 * Any new language should also be added to the documentation
 * https://docs.novu.co/notification-center/client/react/customization#customize-the-ui-language
 */
export type I18NLanguage = 'af' | 'am' | 'ar' | 'as' | 'az' | 'ba' | 'be' | 'bg' | 'bh' | 'bn' | 'bs' | 'ca' | 'cs' | 'da' | 'de' | 'el' | 'en' | 'es' | 'eu' | 'fa' | 'fi' | 'fr' | 'ga' | 'gl' | 'gu' | 'he' | 'hi' | 'hr' | 'hu' | 'hy' | 'id' | 'ig' | 'it' | 'ja' | 'ka' | 'kk' | 'km' | 'kn' | 'ko' | 'ku' | 'lo' | 'lt' | 'lv' | 'ml' | 'mr' | 'ms' | 'nb' | 'ne' | 'nl' | 'or' | 'pa' | 'pl' | 'pt' | 'ro' | 'ru' | 'sa' | 'sd' | 'si' | 'sm' | 'sq' | 'sv' | 'ta' | 'te' | 'th' | 'tl' | 'tr' | 'uk' | 'ur' | 'uz' | 'vi' | 'zh' | 'zu';
//# sourceMappingURL=lang.d.ts.map