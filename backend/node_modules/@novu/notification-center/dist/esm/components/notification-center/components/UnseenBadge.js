import React from 'react';
import { Badge } from '@mantine/core';
import { cx, css } from '@emotion/css';
import { useNovuTheme } from '../../../hooks';
import { useStyles } from '../../../store/styles';
export function UnseenBadge({ unseenCount }) {
    var _a, _b;
    const { theme, common } = useNovuTheme();
    const [unseenBadgeStyles] = useStyles('unseenBadge.root');
    const showUnseenBadge = unseenCount && unseenCount > 0;
    return showUnseenBadge ? (React.createElement(Badge, { "data-test-id": "unseen-count-label", sx: {
            padding: 0,
            marginLeft: 10,
            width: 25,
            height: 20,
            pointerEvents: 'none',
            border: 'none',
            background: (_a = theme.header) === null || _a === void 0 ? void 0 : _a.badgeColor,
            fontFamily: common.fontFamily,
            lineHeight: '14px',
            color: (_b = theme.header) === null || _b === void 0 ? void 0 : _b.badgeTextColor,
            fontWeight: 'bold',
            fontSize: '12px',
        }, radius: 10, className: cx('nc-unseen-badge', css(unseenBadgeStyles)) }, unseenCount > 99 ? '99+' : unseenCount)) : null;
}
//# sourceMappingURL=UnseenBadge.js.map