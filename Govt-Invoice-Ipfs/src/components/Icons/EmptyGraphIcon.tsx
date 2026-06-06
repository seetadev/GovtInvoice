import React from "react";


const EmptyGraphIcon: React.FC<{ width?: number; height?: number }> = ({
    width = 120,
    height = 120,
}) => {
    // Colors based on theme (Light)
    const primaryColor = "#2563eb";
    const secondaryColor = "#f1f5f9";
    const elementColor = "#e2e8f0";

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Background shapes */}
            <circle cx="60" cy="60" r="50" fill={secondaryColor} opacity="0.5" />

            {/* Simplified Graph Lines */}
            <path
                d="M30 80L50 60L70 70L90 40"
                stroke={elementColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Dashed axes */}
            <path
                d="M30 30V90H90"
                stroke={elementColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
            />

            {/* "New" or "Plus" indicator implying potential */}
            <circle cx="90" cy="30" r="12" fill={primaryColor} />
            <path
                d="M90 24V36M84 30H96"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default EmptyGraphIcon;
