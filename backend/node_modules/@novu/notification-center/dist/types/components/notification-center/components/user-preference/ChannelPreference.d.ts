import React from 'react';
interface IChannelPreferenceProps {
    type: string;
    active: boolean;
    handleUpdateChannelPreference: (type: string, checked: boolean) => void;
    disabled: boolean;
}
export declare function ChannelPreference({ type, active, disabled, handleUpdateChannelPreference }: IChannelPreferenceProps): React.JSX.Element;
export {};
//# sourceMappingURL=ChannelPreference.d.ts.map