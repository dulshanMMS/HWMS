"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannel = exports.channels = void 0;
const icons_1 = require("../../../../shared/icons");
exports.channels = [
    { type: 'sms', label: 'SMS', Icon: icons_1.Sms, description: 'This is an sms' },
    { type: 'push', label: 'Push', Icon: icons_1.Mobile, description: 'This is a push' },
    { type: 'email', label: 'Email', Icon: icons_1.Mail, description: 'This is a mail' },
    { type: 'in_app', label: 'In App', Icon: icons_1.Bell, description: 'This is an in app' },
    { type: 'chat', label: 'Chat', Icon: icons_1.Chat, description: 'This is a chat' },
];
const getChannel = (channelKey) => {
    return exports.channels.find((channel) => channel.type === channelKey);
};
exports.getChannel = getChannel;
//# sourceMappingURL=channels.js.map