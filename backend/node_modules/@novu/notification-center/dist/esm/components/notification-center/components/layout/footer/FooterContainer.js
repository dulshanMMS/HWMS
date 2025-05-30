import React from 'react';
import { Footer } from './Footer';
import { useNotificationCenter } from '../../../../../hooks';
export function FooterContainer() {
    const { footer } = useNotificationCenter();
    return React.createElement(React.Fragment, null, footer ? footer() : React.createElement(Footer, null));
}
//# sourceMappingURL=FooterContainer.js.map