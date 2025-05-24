import { IConstructIntegrationDto } from './construct-integration.interface';
import { ChannelTypeEnum } from '../../types';
export interface ICreateIntegrationBodyDto extends IConstructIntegrationDto {
    providerId: string;
    channel: ChannelTypeEnum;
}
//# sourceMappingURL=create-integration.dto.d.ts.map