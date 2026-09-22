import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const followerRef = useRef(null);
    const isDesktopPointer = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    useEffect(() => {
        if (!isDesktopPointer) return;

        const cursor = cursorRef.current;
        const follower = followerRef.current;

        const moveCursor = (e) => {
            if (!cursor || !follower) return;
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
            });
            gsap.to(follower, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.3,
            });
        };

        window.addEventListener('mousemove', moveCursor);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
        };
    }, [isDesktopPointer]);

    if (!isDesktopPointer) return null;

    return (
        <>
            <div ref={cursorRef} className="custom-cursor" style={{ transform: 'translate(-50%, -50%)' }} />
            <div ref={followerRef} className="cursor-follower" style={{ transform: 'translate(-50%, -50%)' }} />
        </>
    );
};

export default CustomCursor;
