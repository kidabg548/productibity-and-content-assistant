import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
        
        const variants = {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
            ghost: 'hover:bg-accent hover:text-accent-foreground'
        };

        return (
            <button
                className={cn(baseStyles, variants[variant], className)}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button }; 