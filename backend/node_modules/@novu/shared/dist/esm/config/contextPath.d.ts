export declare enum NovuComponentEnum {
    WEB = 0,
    API = 1,
    WIDGET = 2,
    WS = 3,
    INBOUND_MAIL = 4,
    WEBHOOK = 5
}
declare global {
    interface Window {
        _env_: Record<string, string | undefined>;
    }
}
export declare function getContextPath(component: NovuComponentEnum): string;
//# sourceMappingURL=contextPath.d.ts.map