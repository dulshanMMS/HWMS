"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILTER_TO_LABEL = void 0;
const types_1 = require("../../types");
exports.FILTER_TO_LABEL = {
    [types_1.FilterPartTypeEnum.PAYLOAD]: 'Payload',
    [types_1.FilterPartTypeEnum.TENANT]: 'Tenant',
    [types_1.FilterPartTypeEnum.SUBSCRIBER]: 'Subscriber',
    [types_1.FilterPartTypeEnum.WEBHOOK]: 'Webhook',
    [types_1.FilterPartTypeEnum.IS_ONLINE]: 'Is online',
    [types_1.FilterPartTypeEnum.IS_ONLINE_IN_LAST]: 'Last time was online',
    [types_1.FilterPartTypeEnum.PREVIOUS_STEP]: 'Previous step',
};
//# sourceMappingURL=filters.js.map