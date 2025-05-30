import { UseQueryOptions } from '@tanstack/react-query';
import type { IStoreQuery } from '@novu/client';
import type { ICountData } from '../shared/interfaces';
export declare const useFeedUnseenCount: ({ query }: {
    query?: IStoreQuery;
}, options?: UseQueryOptions<ICountData, Error, ICountData>) => import("@tanstack/react-query").UseQueryResult<ICountData, Error>;
//# sourceMappingURL=useFeedUnseenCount.d.ts.map