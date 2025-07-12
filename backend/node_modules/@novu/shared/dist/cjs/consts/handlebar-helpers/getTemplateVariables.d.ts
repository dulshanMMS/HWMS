import { TemplateVariableTypeEnum } from '../../types';
export interface IMustacheVariable {
    type: TemplateVariableTypeEnum;
    name: string;
    defaultValue?: string | boolean;
    required?: boolean;
}
export declare function getTemplateVariables(bod: any): IMustacheVariable[];
//# sourceMappingURL=getTemplateVariables.d.ts.map