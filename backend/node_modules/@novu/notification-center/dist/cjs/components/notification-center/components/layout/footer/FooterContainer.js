"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FooterContainer = void 0;
const react_1 = __importDefault(require("react"));
const Footer_1 = require("./Footer");
const hooks_1 = require("../../../../../hooks");
function FooterContainer() {
    const { footer } = (0, hooks_1.useNotificationCenter)();
    return react_1.default.createElement(react_1.default.Fragment, null, footer ? footer() : react_1.default.createElement(Footer_1.Footer, null));
}
exports.FooterContainer = FooterContainer;
//# sourceMappingURL=FooterContainer.js.map