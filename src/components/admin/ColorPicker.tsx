'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui';

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    description?: string;
}

export function ColorPicker({ value, onChange, label, description }: ColorPickerProps) {
    const [localValue, setLocalValue] = useState(value || '#000000');

    // Sync local value when prop changes (e.g., after form reset)
    useEffect(() => {
        if (value && value !== localValue) {
            setLocalValue(value);
        }
    }, [value]);

    // Handle color picker change (fires during drag)
    const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        // Update form immediately for live preview
        onChange(newValue);
    }, [onChange]);

    // Handle text input change
    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;
        // Add # if missing
        if (newValue && !newValue.startsWith('#')) {
            newValue = '#' + newValue;
        }
        setLocalValue(newValue);
    }, []);

    // Commit value on blur (ensures form knows it's dirty)
    const handleBlur = useCallback(() => {
        if (localValue !== value) {
            onChange(localValue);
        }
    }, [localValue, value, onChange]);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            {description && (
                <p className="text-xs text-gray-500">{description}</p>
            )}
            <div className="flex gap-2 items-center">
                <input
                    type="color"
                    value={localValue}
                    onChange={handleColorChange}
                    onBlur={handleBlur}
                    className="w-12 h-12 rounded cursor-pointer border-2 border-gray-200 hover:border-gray-400 transition-colors"
                />
                <Input
                    value={localValue}
                    onChange={handleTextChange}
                    onBlur={handleBlur}
                    dir="ltr"
                    className="flex-1 font-mono"
                    placeholder="#000000"
                />
                {/* Live preview swatch */}
                <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-inner"
                    style={{ backgroundColor: localValue }}
                    title="معاينة"
                />
            </div>
        </div>
    );
}
