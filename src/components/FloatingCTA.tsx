'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { scrollToElement } from '@/lib/utils';

interface FloatingCTAProps {
    /** Custom button color - defaults to red */
    buttonColor?: string;
    /** Text to display on the button */
    buttonText?: string;
    /** Target element ID to scroll to */
    targetId?: string;
}

export function FloatingCTA({
    buttonColor = '#ef4444',
    buttonText = 'سجّل الآن',
    targetId = 'register-form',
}: FloatingCTAProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        // Show CTA after scrolling past hero section (~100vh)
        const handleScroll = () => {
            const heroHeight = window.innerHeight;
            const scrollY = window.scrollY;
            setIsVisible(scrollY > heroHeight * 0.7);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initial position

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleClick = () => {
        scrollToElement(targetId);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Desktop: Floating pill button */}
                    {!isMobile && (
                        <motion.button
                            initial={{ opacity: 0, y: 100, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={handleClick}
                            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-4 text-white font-bold text-lg rounded-full shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-3xl animate-pulse-glow"
                            style={{ backgroundColor: buttonColor }}
                            aria-label={buttonText}
                        >
                            <Heart className="w-5 h-5" />
                            <span>{buttonText}</span>
                        </motion.button>
                    )}

                    {/* Mobile: Full-width sticky bottom bar */}
                    {isMobile && (
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
                        >
                            <button
                                onClick={handleClick}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 text-white font-bold text-lg rounded-xl shadow-lg cursor-pointer transition-all duration-300 active:scale-[0.98] animate-pulse-glow"
                                style={{ backgroundColor: buttonColor }}
                                aria-label={buttonText}
                            >
                                <Heart className="w-5 h-5" />
                                <span>{buttonText}</span>
                            </button>
                        </motion.div>
                    )}
                </>
            )}
        </AnimatePresence>
    );
}
