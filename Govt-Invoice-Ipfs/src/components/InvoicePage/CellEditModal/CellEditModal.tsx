import React, { useState, useEffect, useRef } from 'react';
import {
    IonModal,
    IonButton,
    IonIcon,
    IonAccordion,
    IonAccordionGroup,
    IonItem,
    IonLabel,
} from '@ionic/react';
import {
    closeOutline,
    colorPaletteOutline,
    colorFillOutline,
    chevronDownOutline,
} from 'ionicons/icons';

import * as AppGeneral from '../socialcalc/index.js';
import './CellEditModal.css';

interface CellEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    cellData: {
        coord: string;
        text: string;
        okfn: (value: string) => void;
    } | null;
}



const FONT_COLORS = [
    { name: 'Default', color: null, value: null },
    { name: 'Black', color: '#000000', value: 'black' },
    { name: 'White', color: '#ffffff', value: 'white' },
    { name: 'Red', color: '#ef4444', value: 'red' },
    { name: 'Blue', color: '#3b82f6', value: 'blue' },
    { name: 'Green', color: '#22c55e', value: 'green' },
    { name: 'Yellow', color: '#eab308', value: 'yellow' },
    { name: 'Purple', color: '#a855f7', value: 'purple' },
];

const BG_COLORS = [
    { name: 'Default', color: null, value: null },
    { name: 'White', color: '#ffffff', value: 'white' },
    { name: 'Light Gray', color: '#d1d5db', value: 'lightgray' },
    { name: 'Light Blue', color: '#bfdbfe', value: 'lightblue' },
    { name: 'Light Green', color: '#bbf7d0', value: 'lightgreen' },
    { name: 'Light Yellow', color: '#fef08a', value: 'lightyellow' },
    { name: 'Light Pink', color: '#fbcfe8', value: 'lightpink' },
];

const CellEditModal: React.FC<CellEditModalProps> = ({
    isOpen,
    onClose,
    cellData,
}) => {

    const [inputValue, setInputValue] = useState('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const [selectedFontColor, setSelectedFontColor] = useState<any>(FONT_COLORS[0]); // Default selected
    const [selectedBgColor, setSelectedBgColor] = useState<any>(BG_COLORS[0]); // Default selected
    const [showFontColors, setShowFontColors] = useState(false);
    const [showBgColors, setShowBgColors] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // SDK 35 Fix: Listen for visual viewport resize to detect keyboard
    // On Android 15 with edge-to-edge, adjustResize is ignored so we
    // detect keyboard height via visualViewport and shift the modal up.
    useEffect(() => {
        if (!isOpen) {
            setKeyboardHeight(0);
            return;
        }

        const viewport = window.visualViewport;
        if (!viewport) return;

        const onViewportResize = () => {
            const kbHeight = Math.max(
                0,
                window.innerHeight - viewport.height - viewport.offsetTop
            );
            setKeyboardHeight(kbHeight);
        };

        viewport.addEventListener('resize', onViewportResize);
        viewport.addEventListener('scroll', onViewportResize);
        onViewportResize();

        return () => {
            viewport.removeEventListener('resize', onViewportResize);
            viewport.removeEventListener('scroll', onViewportResize);
            setKeyboardHeight(0);
        };
    }, [isOpen]);

    // Initialize values when modal opens
    useEffect(() => {
        if (isOpen && cellData) {
            setInputValue(cellData.text || '');

            // Fetch current cell formatting and match against color palettes
            let matchedFont = FONT_COLORS[0];
            let matchedBg = BG_COLORS[0];
            try {
                const formatting = AppGeneral.getCellFormatting
                    ? AppGeneral.getCellFormatting(cellData.coord)
                    : null;
                if (formatting) {
                    if (formatting.color) {
                        const found = FONT_COLORS.find(
                            (c) => c.value && c.value.toLowerCase() === formatting.color.toLowerCase()
                        );
                        if (found) matchedFont = found;
                    }
                    if (formatting.bgcolor) {
                        const found = BG_COLORS.find(
                            (c) => c.value && c.value.toLowerCase() === formatting.bgcolor.toLowerCase()
                        );
                        if (found) matchedBg = found;
                    }
                }
            } catch (e) {
                console.warn('Could not read cell formatting:', e);
            }
            setSelectedFontColor(matchedFont);
            setSelectedBgColor(matchedBg);
            setShowFontColors(false);
            setShowBgColors(false);

            // Focus input after modal opens
            // SDK 35 Fix: Increased delay and using requestAnimationFrame to ensure rendering is complete
            // and checking for any competing focus events
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    // Double tap focus for Android WebViews sometimes needed
                    setTimeout(() => inputRef.current?.focus(), 50);
                }
            }, 300);
        }
    }, [isOpen, cellData]);

    const handleClear = () => {
        setInputValue('');
        inputRef.current?.focus();
    };

    const handleApply = () => {
        if (!cellData) return;

        if (import.meta.env.DEV) console.log('Applying change:', inputValue, 'to', cellData.coord);

        // Define formatting object
        const formatting = {
            fontColor: selectedFontColor?.value || selectedFontColor,
            bgColor: selectedBgColor?.value || selectedBgColor,
        };

        try {
            // Use the combined update function for atomic updates (Value + Formatting in one go)
            if (AppGeneral.updateCellValueAndFormat) {
                AppGeneral.updateCellValueAndFormat(cellData.coord, inputValue, formatting);
            } else {
                // Fallback for backward compatibility
                console.warn('AppGeneral.updateCellValueAndFormat not found, using legacy split update');

                // 1. Save Value
                if (cellData.okfn) {
                    cellData.okfn(inputValue);
                }

                // 2. Apply Formatting (with small delay to likely occur after redraw)
                if (formatting.fontColor || formatting.bgColor) {
                    setTimeout(() => {
                        AppGeneral.applySelectedFormatting(cellData.coord, formatting);
                    }, 100);
                }
            }
        } catch (error) {
            console.error('Error applying cell changes:', error);
            // Emergency fallback
            if (cellData.okfn) cellData.okfn(inputValue);
        }

        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onClose}
            className={`cell-edit-modal rounded-modal shadow-modal${keyboardHeight > 0 ? ' keyboard-open' : ''}`}
            backdropDismiss={false}
            style={keyboardHeight > 0 ? {
                '--keyboard-offset': `${keyboardHeight}px`,
                '--max-height': `calc(100vh - ${keyboardHeight}px - 40px)`,
            } as React.CSSProperties : undefined}
        >
            <div className="cell-edit-modal-content">
                {/* Header */}
                <div className="cell-edit-header">
                    <h2 className="cell-edit-title">Edit</h2>
                    <IonButton
                        fill="clear"
                        size="small"
                        className="cell-edit-close-btn"
                        onClick={handleCancel}
                    >
                        <IonIcon icon={closeOutline} />
                    </IonButton>
                </div>

                {/* Input Section */}
                <div className="cell-edit-input-section">
                    <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyPress={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        placeholder="Enter value"
                        className="cell-edit-input"
                    />
                    {inputValue.length > 0 && (
                        <div
                            className="cell-edit-clear-btn"
                            onClick={handleClear}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 3H7C6.31 3 5.77 3.35 5.47 3.88L0.41 12L5.47 20.11C5.77 20.64 6.31 21 7 21H22C23.1 21 24 20.1 24 19V5C24 3.9 23.1 3 22 3ZM18.3 16.3C18.7 16.7 18.7 17.3 18.3 17.7C17.9 18.1 17.3 18.1 16.9 17.7L14.5 15.3L12.1 17.7C11.7 18.1 11.1 18.1 10.7 17.7C10.3 17.3 10.3 16.7 10.7 16.3L13.1 13.9L10.7 11.5C10.3 11.1 10.3 10.5 10.7 10.1C11.1 9.7 11.7 9.7 12.1 10.1L14.5 12.5L16.9 10.1C17.3 9.7 17.9 9.7 18.3 10.1C18.7 10.5 18.7 11.1 18.3 11.5L15.9 13.9L18.3 16.3Z" fill="currentColor" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Properties Accordion */}
                <IonAccordionGroup className="cell-properties-accordion">
                    <IonAccordion value="properties">
                        <IonItem slot="header" lines="none" className="accordion-header compact-header" detail={true}>
                            <IonLabel className="accordion-label">Cell Properties</IonLabel>
                        </IonItem>
                        <div className="ion-padding-vertical" slot="content">
                            {/* Vertical Formatting List */}
                            <div className="cell-edit-properties-list">



                                {/* Text Color Button & Inline Swatches */}
                                <div className="property-row">
                                    <IonButton
                                        fill="clear"
                                        className="property-btn"
                                        expand="block"
                                        onClick={() => {
                                            setShowFontColors(!showFontColors);
                                            setShowBgColors(false);
                                        }}
                                    >
                                        <div className="btn-content-left">
                                            <IonIcon icon={colorPaletteOutline} className="btn-icon" />
                                            <span className="btn-label-main">Color</span>
                                        </div>
                                        <div className="btn-content-right">
                                            {selectedFontColor?.color && (
                                                <div className="color-preview-dot" style={{ background: selectedFontColor.color }}></div>
                                            )}
                                            <span className="btn-value">{selectedFontColor ? selectedFontColor.name : 'Default'}</span>
                                            <IonIcon
                                                icon={chevronDownOutline}
                                                size="small"
                                                className={`btn-chevron ${showFontColors ? 'chevron-up' : ''}`}
                                            />
                                        </div>
                                    </IonButton>
                                    {showFontColors && (
                                        <div className="color-swatches-grid">
                                            {FONT_COLORS.map(c => (
                                                <div
                                                    key={c.name}
                                                    className={`color-swatch ${selectedFontColor?.name === c.name ? 'selected' : ''} ${!c.color ? 'default-swatch' : ''}`}
                                                    style={c.color ? { background: c.color } : {}}
                                                    onClick={() => {
                                                        setSelectedFontColor(c);
                                                        setShowFontColors(false);
                                                    }}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Bg Color Button & Inline Swatches */}
                                <div className="property-row">
                                    <IonButton
                                        fill="clear"
                                        className="property-btn"
                                        expand="block"
                                        onClick={() => {
                                            setShowBgColors(!showBgColors);
                                            setShowFontColors(false);
                                        }}
                                    >
                                        <div className="btn-content-left">
                                            <IonIcon icon={colorFillOutline} className="btn-icon" />
                                            <span className="btn-label-main">Background</span>
                                        </div>
                                        <div className="btn-content-right">
                                            {selectedBgColor?.color && (
                                                <div className="color-preview-dot" style={{ background: selectedBgColor.color }}></div>
                                            )}
                                            <span className="btn-value">{selectedBgColor ? selectedBgColor.name : 'Default'}</span>
                                            <IonIcon
                                                icon={chevronDownOutline}
                                                size="small"
                                                className={`btn-chevron ${showBgColors ? 'chevron-up' : ''}`}
                                            />
                                        </div>
                                    </IonButton>
                                    {showBgColors && (
                                        <div className="color-swatches-grid">
                                            {BG_COLORS.map(c => (
                                                <div
                                                    key={c.name}
                                                    className={`color-swatch ${selectedBgColor?.name === c.name ? 'selected' : ''} ${!c.color ? 'default-swatch' : ''}`}
                                                    style={c.color ? { background: c.color } : {}}
                                                    onClick={() => {
                                                        setSelectedBgColor(c);
                                                        setShowBgColors(false);
                                                    }}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </IonAccordion>
                </IonAccordionGroup>

                {/* Action Buttons */}
                <div className="cell-edit-actions">
                    <IonButton
                        fill="outline"
                        color="medium"
                        onClick={handleCancel}
                    >
                        Cancel
                    </IonButton>
                    <IonButton
                        fill="solid"
                        color="primary"
                        onClick={handleApply}
                    >
                        Apply
                    </IonButton>
                </div>
            </div>
        </IonModal>
    );
};

export default CellEditModal;
