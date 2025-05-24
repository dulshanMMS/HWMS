var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useMemo, useLayoutEffect } from 'react';
import { Tabs as MantineTabs } from '@mantine/core';
import styled from '@emotion/styled';
import { NotificationsListTab } from './NotificationsListTab';
import { UnseenBadge } from './UnseenBadge';
import { Tabs } from './layout/tabs/Tabs';
import { useNotificationCenter, useNotifications, useFeedUnseenCount, useNovuContext } from '../../../hooks';
export function FeedsTabs() {
    const { tabs, onTabClick } = useNotificationCenter();
    const { storeId, setStore, markFetchedNotificationsAsSeen } = useNotifications();
    const { setFetchingStrategy } = useNovuContext();
    function handleOnTabChange(newStoreId) {
        return __awaiter(this, void 0, void 0, function* () {
            markFetchedNotificationsAsSeen();
            setStore(newStoreId);
        });
    }
    useLayoutEffect(() => {
        setFetchingStrategy({ fetchNotifications: true });
    }, [setFetchingStrategy]);
    return (React.createElement(React.Fragment, null, (tabs === null || tabs === void 0 ? void 0 : tabs.length) ? (React.createElement(Tabs, { value: storeId, onTabChange: handleOnTabChange },
        React.createElement(MantineTabs.List, null, tabs.map((tab, index) => (React.createElement(MantineTabs.Tab, { onClick: () => {
                onTabClick(tab);
            }, key: index, "data-test-id": `tab-${tab.storeId}`, value: tab.storeId },
            React.createElement(TabLabelWrapper, null,
                tab.name,
                React.createElement(UnseenBadgeContainer, { storeId: tab.storeId })))))),
        tabs.map((tab, index) => (React.createElement(MantineTabs.Panel, { value: tab.storeId, key: index },
            React.createElement(NotificationsListTab, null)))))) : (React.createElement(NotificationsListTab, null))));
}
const TabLabelWrapper = styled.div `
  margin-bottom: 13px;
  min-height: 22px;
  line-height: 19px;
`;
function UnseenBadgeContainer({ storeId }) {
    var _a;
    const { stores } = useNotifications();
    const query = useMemo(() => {
        var _a;
        const foundQuery = ((_a = stores === null || stores === void 0 ? void 0 : stores.find((i) => i.storeId === storeId)) === null || _a === void 0 ? void 0 : _a.query) || {};
        return Object.assign({}, foundQuery, { seen: false, limit: 100 });
    }, [stores]);
    const { data } = useFeedUnseenCount({ query });
    const unseenCount = query.seen ? 0 : (_a = data === null || data === void 0 ? void 0 : data.count) !== null && _a !== void 0 ? _a : 0;
    return React.createElement(UnseenBadge, { unseenCount: unseenCount });
}
//# sourceMappingURL=FeedsTabs.js.map