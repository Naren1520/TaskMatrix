import React, { useMemo } from 'react';
import logo from '../assets/logo.png';

export const Loader = () => {
  const particles = useMemo(() => {
    const generateParticles = () => {
      return [...Array(20)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 5 + Math.random() * 10,
        delay: Math.random() * 5
      }));
    };
    return generateParticles();
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" />
      </div>

      {/* Floating Particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-40"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        {/* Main Logo Container */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48">
          {/* Outer Glow Effect */}
          <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          
          {/* Hexagonal Border Animation */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            style={{ animation: 'rotate 8s linear infinite' }}
          >
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <polygon
              points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="0.5"
              opacity="0.6"
            />
          </svg>

          {/* Middle Rotating Circles */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            style={{ animation: 'rotate 6s linear infinite reverse' }}
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(168, 85, 247, 0.4)"
              strokeWidth="0.5"
              strokeDasharray="5,5"
            />
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="rgba(236, 72, 153, 0.3)"
              strokeWidth="0.5"
              strokeDasharray="3,3"
            />
          </svg>

          {/* Logo Circle with Glass Effect */}
          <div className="absolute inset-0 m-auto w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 shadow-2xl flex items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-inner">
              <img
                src={logo}
                alt="TaskMatrix logo"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
              />
            </div>
          </div>

          {/* Orbiting Dots */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-lg"
              style={{
                top: '50%',
                left: '50%',
                animation: `orbit 4s linear infinite`,
                animationDelay: `${i * 1}s`,
                transformOrigin: '0 0'
              }}
            />
          ))}

          {/* Scanning Line Effect */}
          <div
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{ animation: 'scan 3s ease-in-out infinite' }}
          >
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
          </div>
        </div>

        {/* Title with Gradient Text */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent tracking-wider animate-shimmer bg-[length:200%_100%]">
            TaskMatrix
          </h1>
          <p className="text-sm sm:text-base text-purple-300/80 font-light tracking-wide">
            By Naren S J
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 sm:w-80 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full"
            style={{
              animation: 'progress 2s ease-in-out infinite',
              backgroundSize: '200% 100%'
            }}
          />
        </div>

        {/* Loading Text with Typing Effect */}
        <div className="flex items-center gap-3 text-purple-300/90 text-sm sm:text-base font-light">
          <span className="tracking-wider">Initializing</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400"
                style={{
                  animation: 'pulse 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes orbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg) translateX(80px) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg) translateX(80px) rotate(-360deg);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes scan {
          0%, 100% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
        }
        
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};