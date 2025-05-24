import React from 'react';
/* eslint-disable */
export function GradientDot(props) {
    const color = props.colors.unseenBadgeColor;
    const regularColor = typeof color === 'string';
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 16 16", fill: "none" }, props),
        React.createElement("rect", { x: "1.5", y: "1.5", width: "13", height: "13", rx: "6.5", fill: "url(#paint0_linear_1722_2699)", stroke: props.colors.unseenBadgeBackgroundColor, strokeWidth: "3" }),
        React.createElement("defs", null,
            React.createElement("linearGradient", { id: "paint0_linear_1722_2699", x1: "8", y1: "13", x2: "8", y2: "3", gradientUnits: "userSpaceOnUse" },
                React.createElement("stop", { stopColor: regularColor ? color : color.stopColor }),
                React.createElement("stop", { offset: "1", stopColor: regularColor ? color : color.stopColorOffset })))));
}
//# sourceMappingURL=GradientDot.js.map