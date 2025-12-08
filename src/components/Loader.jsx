import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center gap-6"
      >
        {/* Circular Logo Container */}
        <motion.div
          className="relative w-32 h-32 sm:w-40 sm:h-40"
        >
          {/* Outer Circles */}
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity="0.3"
            />
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              opacity="0.2"
            />
          </motion.svg>

          {/* Logo Image in Static Circle */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full shadow-2xl overflow-hidden">
            <img
              src={logo}
              alt="TaskMatrix Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 object-cover"
            />
          </div>

          {/* Rotating Border Circle */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-widest">
            TaskMatrix
          </h1>
          {/* Byline */}
          <p className="text-xs sm:text-sm text-white/70 mt-3 font-light">
            By Naren S J
          </p>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex gap-2 mt-6"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
              }}
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
