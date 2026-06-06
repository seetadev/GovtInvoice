import React from 'react';

interface IconProps {
    size?: number;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    title?: string;
    id?: string;
}

export const SaveIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className,
    style,
    onClick,
    title
}) => (
    <div
        onClick={onClick}
        className={className}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, ...style }}
        title={title}
    >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H16L20 7V20C20 20.5523 19.5523 21 19 21Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 21V13H7V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 3V8H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

export const ShareIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className,
    style,
    onClick,
    title
}) => (
    <div
        onClick={onClick}
        className={className}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, ...style }}
        title={title}
    >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 6L12 2L8 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 2V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

export const MoreIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className,
    style,
    onClick,
    title,
    id
}) => (
    <div
        id={id}
        onClick={onClick}
        className={className}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, ...style }}
        title={title}
    >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="5" r="1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="19" r="1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);
