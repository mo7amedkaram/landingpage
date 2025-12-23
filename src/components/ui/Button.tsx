import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', style, ...props }, ref) => {
        // Check if custom backgroundColor is provided via style prop
        const hasCustomBg = style?.backgroundColor;

        return (
            <button
                className={cn(
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                    {
                        // Only apply default gradient if NO custom backgroundColor is provided
                        'bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl': variant === 'default' && !hasCustomBg,
                        // When custom bg is provided, just add text color and shadow
                        'text-white shadow-lg hover:shadow-xl hover:brightness-110': variant === 'default' && hasCustomBg,
                        'border-2 border-blue-600 text-blue-600 hover:bg-blue-50': variant === 'outline',
                        'hover:bg-gray-100': variant === 'ghost',
                        'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
                    },
                    {
                        'h-10 px-4 py-2 text-sm': size === 'default',
                        'h-9 px-3 text-xs': size === 'sm',
                        'h-14 px-8 text-lg': size === 'lg',
                        'h-10 w-10': size === 'icon',
                    },
                    className
                )}
                ref={ref}
                style={style}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button };
