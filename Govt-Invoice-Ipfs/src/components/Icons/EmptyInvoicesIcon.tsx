import React from "react";


const EmptyInvoicesIcon: React.FC<{ width?: number; height?: number }> = ({
    width = 120,
    height = 120,
}) => {
    // Colors based on theme (Light)
    const primaryColor = "#2563eb";
    const secondaryColor = "#f1f5f9";
    const elementColor = "#e2e8f0";
    const paperColor = "#ffffff";
    const paperBorder = "#cbd5e1";

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Stacked Papers Effect */}
            <rect
                x="45"
                y="35"
                width="40"
                height="50"
                rx="2"
                fill={secondaryColor}
                stroke={elementColor}
                strokeWidth="2"
                transform="rotate(6 65 60)"
            />
            <rect
                x="40"
                y="35"
                width="40"
                height="50"
                rx="2"
                fill={secondaryColor}
                stroke={elementColor}
                strokeWidth="2"
                transform="rotate(-6 60 60)"
            />

            {/* Main Paper */}
            <rect
                x="35"
                y="25"
                width="50"
                height="65"
                rx="4"
                fill={paperColor}
                stroke={paperBorder}
                strokeWidth="2"
            />

            {/* Content lines */}
            <path
                d="M45 40H75"
                stroke={elementColor}
                strokeWidth="3"
                strokeLinecap="round"
            />
            <path
                d="M45 50H75"
                stroke={elementColor}
                strokeWidth="3"
                strokeLinecap="round"
            />
            <path
                d="M45 60H65"
                stroke={elementColor}
                strokeWidth="3"
                strokeLinecap="round"
            />

            {/* Magnifying glass "Not Found" metaphor */}
            <circle
                cx="80"
                cy="80"
                r="18"
                fill={primaryColor}
                stroke={paperColor}
                strokeWidth="4"
            />
            <path
                d="M71 80L89 80"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default EmptyInvoicesIcon;
