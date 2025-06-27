import React from "react";
import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="relative">
                {/* Background noise SVG */}
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 422 95" 
                    fill="none"
                    className="w-80 h-16 sm:w-96 sm:h-20 md:w-[350px] md:h-24 backdrop-blur-sm rounded-lg"
                >
                    <g filter="url(#filter0_n_23_800)">
                        <rect width="422" height="95" rx="25" fill="black" fillOpacity="0.68" />
                    </g>
                    <defs>
                        <filter id="filter0_n_23_800" x="0" y="0" width="422" height="95" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                            <feTurbulence type="fractalNoise" baseFrequency="2 2" stitchTiles="stitch" numOctaves="3" result="noise" seed="6051" />
                            <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
                            <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                                <feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " />
                            </feComponentTransfer>
                            <feComposite operator="in" in2="shape" in="coloredNoise1" result="noise1Clipped" />
                            <feFlood floodColor="rgba(255, 255, 255, 0.32)" result="color1Flood" />
                            <feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
                            <feMerge result="effect1_noise_23_800">
                                <feMergeNode in="shape" />
                                <feMergeNode in="color1" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>

                {/* Logo and text on top */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 ">
                    <Image src="/IPOtrackr.svg" alt="IPOtrackr Logo" width={50} height={50} />
                    <span className="text-white text-4xl md:text-6xl lg:text-5xl font-semibold">IPOtrackr</span>
                </div>
            </div>
        </nav>
    );
}