"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeenAllBlock = void 0;
const react_1 = __importDefault(require("react"));
const styled_1 = __importDefault(require("@emotion/styled"));
function SeenAllBlock() {
    return react_1.default.createElement(Wrapper, null, "Yay! You have seen it all");
}
exports.SeenAllBlock = SeenAllBlock;
const Wrapper = styled_1.default.div `
  text-align: center;
  margin: 10px 0;
  font-size: 10px;
  color: #b1b1b1;
`;
//# sourceMappingURL=SeenAllBlock.js.map