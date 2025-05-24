/**
 * The code was taken from the following repository: https://github.com/bitovi/react-to-webcomponent
 * and improved to support rendering React through Web Components in the AngularJS app
 */
import React from 'react';
interface R2WCOptions {
    shadow?: string | boolean;
    props?: Array<string> | Record<string, unknown>;
}
/**
 * Converts a React component into a webcomponent by wrapping it in a Proxy object.
 * @param {ReactComponent}
 * @param {React}
 * @param {ReactDOM}
 * @param {Object} options - Optional parameters
 * @param {String?} options.shadow - Shadow DOM mode as either open or closed.
 * @param {Object|Array?} options.props - Array of camelCasedProps to watch as Strings or { [camelCasedProp]: String | Number | Boolean | Function | Object | Array }
 */
export default function (ReactComponent: React.FunctionComponent<any> | React.ComponentClass<any>, options?: R2WCOptions): CustomElementConstructor;
export {};
//# sourceMappingURL=react-to-webcomponent.d.ts.map