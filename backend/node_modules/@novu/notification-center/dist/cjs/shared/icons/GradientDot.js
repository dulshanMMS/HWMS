"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradientDot = void 0;
const react_1 = __importDefault(require("react"));
/* eslint-disable */
function GradientDot(props) {
    const color = props.colors.unseenBadgeColor;
    const regularColor = typeof color === 'string';
    return (react_1.default.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 16 16", fill: "none" }, props),
        react_1.default.createElement("rect", { x: "1.5", y: "1.5", width: "13", height: "13", rx: "6.5", fill: "url(#paint0_linear_1722_2699)", stroke: props.colors.unseenBadgeBackgroundColor, strokeWidth: "3" }),
        react_1.default.createElement("defs", null,
            react_1.default.createElement("linearGradient", { id: "paint0_linear_1722_2699", x1: "8", y1: "13", x2: "8", y2: "3", gradientUnits: "userSpaceOnUse" },
                react_1.default.createElement("stop", { stopColor: regularColor ? color : color.stopColor }),
                react_1.default.createElement("stop", { offset: "1", stopColor: regularColor ? color : color.stopColorOffset })))));
}
exports.GradientDot = GradientDot;
//# sourceMappingURL=GradientDot.js.map