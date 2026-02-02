
import React from 'react';
import { Language, t } from '../../translations';

interface LungsLoaderProps {
    className?: string;
    size?: number;
    progress?: number; // 0 to 100
    lang?: Language;
}

const BoltIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export const LungsLoader = ({ className = "", size = 160, progress = 0, lang = 'ru' }: LungsLoaderProps) => {
    const T = t[lang];
    const LOGO_PATH = "M400 0C420.678 0 437.504 16.8256 437.504 37.5039V199.116C437.504 227.542 439.651 242.909 481.911 244.089C486.115 153.416 506.177 56.9141 586.956 56.9141C702.501 56.9147 799.992 363.723 799.992 556.414C800.043 562.452 800.747 705.77 761.503 745.335C754.348 752.541 746.194 756.202 737.26 756.202C713.637 756.202 701.893 747.179 685.631 734.692C665.234 719.044 637.298 697.591 566.43 677.156C446.252 642.507 458.751 530.084 471.986 411.038C475.347 380.782 478.796 349.735 480.229 319.07C446.442 318.034 419.432 309.567 399.98 293.849C380.535 309.566 353.572 318.034 319.787 319.07C321.219 349.736 324.667 380.787 328.038 411.038C341.273 530.084 353.759 642.507 233.594 677.156C162.714 697.591 134.784 719.044 114.381 734.705C98.1184 747.179 86.3741 756.202 62.7518 756.202C53.8111 756.202 45.6579 752.541 38.5028 745.335C-0.748344 705.77 -0.0381168 562.442 0.0066831 556.362C0.0068066 363.716 97.5039 56.9144 213.056 56.9141C293.823 56.9141 313.897 153.416 318.104 244.089C360.349 242.903 362.496 227.536 362.496 199.116V37.5039C362.496 16.8256 379.322 3.31089e-05 400 0Z";

    // Наполнение сиропом
    const fillY = 800 - (800 * (progress / 100));
    const isComplete = progress >= 100;

    return (
        <div className={`flex flex-col items-center justify-center gap-6 ${className} antialiased transition-all duration-500 ${isComplete ? 'scale-110' : 'scale-100'}`}>
            <div className="relative" style={{ width: size, height: size * (757/800) }}>
                <svg
                    viewBox="0 0 800 757"
                    className="w-full h-full drop-shadow-[0_10px_30px_rgba(37,99,235,0.15)] transition-all duration-700"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <clipPath id="brandLogoClip">
                            <path d={LOGO_PATH} />
                        </clipPath>
                        <linearGradient id="syrupGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                    </defs>

                    <path 
                        d={LOGO_PATH} 
                        fill="#F8FAFC"
                    />

                    <g clipPath="url(#brandLogoClip)">
                        <rect 
                            x="0" 
                            y="0" 
                            width="800" 
                            height="800" 
                            fill="url(#syrupGradient)" 
                            style={{ 
                                transform: `translateY(${fillY}px)`,
                                transition: progress > 90 
                                    ? 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
                                    : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
                            }}
                        />
                    </g>

                    <path 
                        d={LOGO_PATH} 
                        stroke={isComplete ? "#2563eb" : "#E2E8F0"} 
                        strokeWidth={isComplete ? "5" : "3"}
                        className="transition-all duration-500"
                    />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className={`text-2xl font-black transition-all duration-500 ${progress > 50 ? 'text-white scale-110 drop-shadow-md' : 'text-blue-600/40'}`}>
                        {Math.round(progress)}%
                    </span>
                </div>
            </div>

            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                   <BoltIcon className="w-5 h-5 text-blue-600 fill-current drop-shadow-sm" />
                   <span className="text-[16px] font-black text-slate-800 uppercase tracking-tighter italic">
                       ЛАМБРОТИН
                   </span>
                </div>
                
                <div className="h-4 flex items-center justify-center overflow-hidden">
                    <span 
                        className="text-[10px] font-bold text-blue-500 uppercase tracking-widest animate-message-fade"
                    >
                        {T.loaderText}
                    </span>
                </div>
            </div>

            <style>{`
                @keyframes messageFade {
                    0% { opacity: 0; transform: translateY(5px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-message-fade {
                    animation: messageFade 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
