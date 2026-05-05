import React from "react";

interface ShineBorderProps {
    borderRadius?: number;
    borderWidth?: number;
    duration?: number;
    color?: string | string[];
    className?: string;
    children: React.ReactNode;
}

export default function ShineBorder({
    borderRadius = 8,
    borderWidth = 1,
    duration = 30, // Segundos que tarda en dar una vuelta completa
    color = "#000000",
    className = "",
    children,
}: ShineBorderProps) {
    const colors = Array.isArray(color) ? color.join(",") : color;

    return (
        <>
            {/* TODO(CSP): Move this embedded <style> block to a static stylesheet before enforcing CSP. */}
            <style>
                {`
                @keyframes shine-anim {
                    0% { background-position: 0% 0%; }
                    50% { background-position: 100% 100%; }
                    100% { background-position: 0% 0%; }
                }
                .animate-shine-magic {
                    animation: shine-anim var(--duration) infinite linear;
                }
                `}
            </style>

            <div
                style={
                    {
                        "--border-radius": `${borderRadius}px`,
                    } as React.CSSProperties
                }
                className={`relative rounded-[var(--border-radius)] ${className}`}
            >
                <div
                    style={
                        {
                            "--border-width": `${borderWidth}px`,
                            "--border-radius": `${borderRadius}px`,
                            "--duration": `${duration}s`,
                            "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
                            "--background-radial-gradient": `radial-gradient(transparent, transparent, ${colors}, transparent, transparent)`,
                        } as React.CSSProperties
                    }
                    className={`pointer-events-none absolute inset-0 w-full h-full rounded-[var(--border-radius)] p-[var(--border-width)] will-change-[background-position] ![-webkit-mask-composite:xor] ![mask-composite:exclude] [-webkit-mask:var(--mask-linear-gradient)] [mask:var(--mask-linear-gradient)] [background-image:var(--background-radial-gradient)] [background-size:300%_300%] animate-shine-magic`}
                />

                {children}
            </div>
        </>
    );
}
