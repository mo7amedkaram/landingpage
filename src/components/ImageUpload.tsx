'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('يرجى اختيار ملف صورة فقط');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const url = await uploadImage(file);
            if (url) {
                onChange(url);
            } else {
                setError('فشل رفع الصورة. تأكد من إعداد Supabase Storage.');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('حدث خطأ أثناء رفع الصورة');
        } finally {
            setIsUploading(false);
        }
    }, [onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
        },
        maxFiles: 1,
        disabled: isUploading,
    });

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className={cn('w-full', className)}>
            {value ? (
                // Image Preview
                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                    <img
                        src={value}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                // Drop Zone
                <div
                    {...getRootProps()}
                    className={cn(
                        'relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                        isDragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100',
                        isUploading && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <>
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                            <p className="text-gray-600">جاري رفع الصورة...</p>
                        </>
                    ) : (
                        <>
                            {isDragActive ? (
                                <Upload className="w-10 h-10 text-blue-500 mb-3" />
                            ) : (
                                <ImageIcon className="w-10 h-10 text-gray-400 mb-3" />
                            )}
                            <p className="text-gray-600 text-center">
                                {isDragActive
                                    ? 'أفلت الصورة هنا...'
                                    : 'اسحب صورة هنا أو اضغط للاختيار'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                PNG, JPG, WEBP (حد أقصى 5 ميجابايت)
                            </p>
                        </>
                    )}
                </div>
            )}

            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
