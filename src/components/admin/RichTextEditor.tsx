'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Typography } from '@tiptap/extension-typography';
import {
    Bold,
    Italic,
    Highlighter,
    Type,
    Heading1,
    Heading2,
    Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const colorPresets = [
    { name: 'أحمر', color: '#ef4444' },
    { name: 'أخضر', color: '#22c55e' },
    { name: 'أزرق', color: '#3b82f6' },
    { name: 'برتقالي', color: '#f97316' },
    { name: 'بنفسجي', color: '#a855f7' },
    { name: 'أسود', color: '#000000' },
];

interface MenuBarProps {
    editor: Editor | null;
}

function MenuBar({ editor }: MenuBarProps) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setShowColorPicker(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!editor) return null;

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 rounded-t-lg">
            {/* Typography Group */}
            <div className="flex items-center gap-0.5 border-l pl-2 ml-2">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(
                        'p-2 rounded hover:bg-gray-200 transition-colors',
                        editor.isActive('bold') && 'bg-gray-200 text-blue-600'
                    )}
                    title="عريض"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(
                        'p-2 rounded hover:bg-gray-200 transition-colors',
                        editor.isActive('italic') && 'bg-gray-200 text-blue-600'
                    )}
                    title="مائل"
                >
                    <Italic className="w-4 h-4" />
                </button>
            </div>

            {/* Heading Group */}
            <div className="flex items-center gap-0.5 border-l pl-2 ml-2">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn(
                        'p-2 rounded hover:bg-gray-200 transition-colors',
                        editor.isActive('heading', { level: 1 }) && 'bg-gray-200 text-blue-600'
                    )}
                    title="عنوان 1"
                >
                    <Heading1 className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn(
                        'p-2 rounded hover:bg-gray-200 transition-colors',
                        editor.isActive('heading', { level: 2 }) && 'bg-gray-200 text-blue-600'
                    )}
                    title="عنوان 2"
                >
                    <Heading2 className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={cn(
                        'p-2 rounded hover:bg-gray-200 transition-colors',
                        editor.isActive('paragraph') && !editor.isActive('heading') && 'bg-gray-200 text-blue-600'
                    )}
                    title="فقرة عادية"
                >
                    <Type className="w-4 h-4" />
                </button>
            </div>

            {/* Styling Group */}
            <div className="flex items-center gap-0.5 border-l pl-2 ml-2">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
                    className={cn(
                        'p-2 rounded hover:bg-gray-200 transition-colors',
                        editor.isActive('highlight') && 'bg-yellow-200 text-yellow-800'
                    )}
                    title="تمييز"
                >
                    <Highlighter className="w-4 h-4" />
                </button>

                {/* Color Picker */}
                <div className="relative" ref={colorPickerRef}>
                    <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className={cn(
                            'p-2 rounded hover:bg-gray-200 transition-colors flex items-center gap-1',
                            showColorPicker && 'bg-gray-200'
                        )}
                        title="لون النص"
                    >
                        <Palette className="w-4 h-4" />
                    </button>

                    {showColorPicker && (
                        <div className="absolute top-full right-0 mt-1 p-2 bg-white rounded-lg shadow-xl border z-50 min-w-[120px]">
                            <div className="grid grid-cols-3 gap-1">
                                {colorPresets.map((preset) => (
                                    <button
                                        key={preset.color}
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().setColor(preset.color).run();
                                            setShowColorPicker(false);
                                        }}
                                        className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                                        style={{ backgroundColor: preset.color }}
                                        title={preset.name}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().unsetColor().run();
                                    setShowColorPicker(false);
                                }}
                                className="w-full mt-2 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                            >
                                إزالة اللون
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2],
                },
            }),
            Highlight.configure({
                multicolor: true,
            }),
            TextStyle,
            Color,
            Typography,
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-4 text-right',
                dir: 'rtl',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update content when value changes externally
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div className={cn('border rounded-lg overflow-hidden bg-white', className)}>
            <MenuBar editor={editor} />
            <EditorContent
                editor={editor}
                className="[&_.ProseMirror]:min-h-[120px] [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_mark]:bg-yellow-200 [&_.ProseMirror_mark]:px-1 [&_.ProseMirror_mark]:rounded"
            />
            {placeholder && !value && (
                <div className="absolute top-16 right-4 text-gray-400 pointer-events-none">
                    {placeholder}
                </div>
            )}
        </div>
    );
}
