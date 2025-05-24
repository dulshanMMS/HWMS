import React, { useState } from 'react';
import { Popover as MantinePopover, createStyles } from '@mantine/core';
import styled from '@emotion/styled';
import { css } from '@emotion/css';
import { useStyles } from '../../../store/styles';
import { useNotifications } from '../../../hooks';
export function Popover({ children, bell, theme, offset = 0, position = 'bottom-end' }) {
    var _a;
    const [isVisible, setIsVisible] = useState(false);
    const { cx, classes } = usePopoverStyles((_a = theme.popover) === null || _a === void 0 ? void 0 : _a.arrowColor);
    const [popoverArrowStyles, popoverDropdownStyles] = useStyles(['popover.arrow', 'popover.dropdown']);
    const overrideClasses = {
        arrow: cx(classes.arrow, css(popoverArrowStyles)),
        dropdown: cx(classes.dropdown, css(popoverDropdownStyles)),
    };
    const { markFetchedNotificationsAsSeen } = useNotifications();
    function handlerBellClick() {
        if (isVisible) {
            markFetchedNotificationsAsSeen();
        }
        setIsVisible(!isVisible);
    }
    function handlerOnClose() {
        setIsVisible(false);
        markFetchedNotificationsAsSeen();
    }
    return (React.createElement(MantinePopover, { opened: isVisible, onClose: handlerOnClose, position: position, withArrow: true, classNames: overrideClasses, offset: offset, withinPortal: true },
        React.createElement(MantinePopover.Target, null,
            React.createElement(BellContainer, { onClick: handlerBellClick },
                " ",
                bell({}))),
        React.createElement(MantinePopover.Dropdown, null,
            " ",
            children)));
}
const BellContainer = styled.span ``;
const usePopoverStyles = createStyles((theme, arrowColor) => ({
    dropdown: {
        padding: '0px',
        backgroundColor: 'transparent',
        border: 'none',
    },
    arrow: {
        background: arrowColor,
        backgroundColor: arrowColor,
        borderColor: arrowColor,
    },
}));
//# sourceMappingURL=Popover.js.map