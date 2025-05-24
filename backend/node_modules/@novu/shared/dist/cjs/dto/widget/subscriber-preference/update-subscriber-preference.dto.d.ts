import { ChannelTypeEnum } from '../../../types';
export interface IUpdateSubscriberPreferenceDto {
    channel?: IChannelPreference;
    enabled?: boolean;
}
export interface IChannelPreference {
    type: ChannelTypeEnum;
    enabled: boolean;
}
//# sourceMappingURL=update-subscriber-preference.dto.d.ts.map