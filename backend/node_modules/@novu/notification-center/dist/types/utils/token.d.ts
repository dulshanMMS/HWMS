import type { ApiService } from '@novu/client';
export declare const getToken: () => string | null;
export declare const removeToken: (apiService: ApiService) => void;
export declare const applyToken: ({ token, apiService }: {
    token?: string | null;
    apiService: ApiService;
}) => void;
//# sourceMappingURL=token.d.ts.map