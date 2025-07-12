import React from 'react';
import { IThemeUserPreferences } from '../../../../store/novu-theme.context';
export declare const accordionStyles: (baseTheme: IThemeUserPreferences, font: string) => {
    item: {
        borderBottom: string;
        boxShadow: string;
        backgroundColor: string;
        marginBottom: string;
        borderRadius: string;
    };
    content: {
        color: string;
        fontFamily: string;
    };
    control: {
        fontFamily: string;
        height: string;
        '&:hover': {
            backgroundColor: string;
            borderRadius: string;
        };
    };
    chevron: {
        color: string;
    };
};
export declare const switchStyles: (baseTheme: IThemeUserPreferences) => {
    root: {
        width: string;
        maxWidth: string;
        display: string;
        alignItems: string;
    };
    input: {
        background: string;
        width: string;
        height: string;
        border: string;
        cursor: string;
        '&::before': {
            border: string;
            width: string;
            height: string;
        };
        '&:checked ~ label': {
            background: string;
        };
        '&:not(checked) ~ label': {
            background: string;
        };
        '&:disabled:not(:checked) ~ label': {
            background: string;
        };
        '&:disabled': {
            opacity: number;
        };
    };
    track: {
        width: string;
        height: string;
        border: string;
    };
    thumb: {
        border: string;
    };
};
export declare const Text: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType<any, keyof React.JSX.IntrinsicElements>;
} & {
    size: 'sm' | 'md' | 'lg';
}, React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
export declare const TextBlock: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType<any, keyof React.JSX.IntrinsicElements>;
}, React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
//# sourceMappingURL=styles.d.ts.map