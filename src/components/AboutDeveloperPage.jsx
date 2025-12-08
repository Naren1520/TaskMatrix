import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
// reference motion to satisfy some static analyzers that check for usage
void motion;
import profileImg from '../assets/NarenSJ.jpg';

// Custom SVG Icons
const GithubIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const MailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

export const AboutDeveloperPage = ({ onBack }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // create particle positions once on mount to avoid impure calls during render
    const pts = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      xOffset: Math.random() * 20 - 10,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    const t = setTimeout(() => setParticles(pts), 0);
    return () => clearTimeout(t);
  }, []);

  const socials = [
    { icon: GithubIcon, href: 'https://github.com/Naren1520', label: 'GitHub', color: 'from-gray-700 to-gray-900' },
    { icon: LinkedinIcon, href: 'https://www.linkedin.com/in/narensj20/', label: 'LinkedIn', color: 'from-blue-600 to-blue-800' },
    { icon: InstagramIcon, href: 'https://www.instagram.com/naren_s.j._/', label: 'Instagram', color: 'from-pink-500 to-purple-600' },
    { icon: GlobeIcon, href: 'https://narensj20.netlify.app/', label: 'Portfolio', color: 'from-green-500 to-teal-600' },
    { icon: MailIcon, href: 'mailto:narensonu1520@gmail.com', label: 'Email', color: 'from-red-500 to-orange-600' },
  ];

  const skills = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Tailwind CSS', 'Framer Motion', 'Node.js', 'Express', 'MongoDB', 'Git', 'Figma', 'UI/UX Design','Next.js','Supabase','C','Java','Python','Rust','Flutter','API'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 text-gray-900 dark:text-gray-100 relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        className="absolute w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"
        animate={{
          x: mousePosition.x / 50,
          y: mousePosition.y / 50,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 30 }}
        style={{ top: '10%', left: '10%' }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl"
        animate={{
          x: -mousePosition.x / 30,
          y: -mousePosition.y / 30,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 30 }}
        style={{ bottom: '10%', right: '10%' }}
      />

      {/* Floating particles (generated once on mount) */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-500/30 dark:bg-blue-400/20 rounded-full"
          animate={{
            y: [0, -30, 0],
            x: [0, p.xOffset, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
          }}
          style={{
            left: p.left,
            top: p.top,
          }}
        />
      ))}

      <div className="max-w-6xl mx-auto py-12 px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <motion.h2
              className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              About the Developer
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 dark:text-gray-400 mt-2"
            >
              Crafting digital experiences with passion
            </motion.p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBack && onBack()}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-xs sm:text-sm md:text-base"
          >
            <FiArrowLeft size={18} />
            Back to Tasks
          </motion.button>
        </motion.div>

        {/* Main Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50"
        >
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Profile Image with 3D effect */}
            <motion.div
              variants={itemVariants}
              className="relative group"
              onHoverStart={() => setIsHoveringProfile(true)}
              onHoverEnd={() => setIsHoveringProfile(false)}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-75"
                animate={{
                  scale: isHoveringProfile ? 1.2 : 1,
                  rotate: isHoveringProfile ? 360 : 0,
                }}
                transition={{ duration: 0.8 }}
              />
              <motion.div
                className="relative w-48 h-48 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shadow-2xl z-10 border-4 border-white dark:border-gray-700"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img
                  src={profileImg}
                  alt="Naren S J"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg z-20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl">👨‍💻</span>
              </motion.div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 space-y-6">
              <motion.div variants={itemVariants}>
                <motion.h3
                  className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.02 }}
                >
                  Naren S J
                </motion.h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  I build <span className="font-semibold text-blue-600 dark:text-blue-400">TaskMatrix</span> and other  full-stack and cybersecurity projects with fast, secure, and scalable applications. I combine clean UI/UX, strong backend architecture, and security-first thinking to create systems that perform, protect, and grow.
                </p>
              </motion.div>

              <motion.p variants={itemVariants} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                I love the intersection of engineering and design—crafting intuitive interfaces, refining micro-interactions, and building tools that encourage better routines. My side projects often evolve into open-source libraries, design system explorations, or compact JavaScript utilities built for speed and clarity.
              </motion.p>

              {/* Skills with floating animation */}
              <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
                {skills.map((skill, i) => (
                  <motion.span
                    key={skill}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-sm rounded-full text-sm font-medium border border-blue-500/20 dark:border-purple-500/30"
                    whileHover={{ scale: 1.1, y: -5 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      y: {
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }
                    }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>

              {/* Social Links with gradient backgrounds */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 pt-4">
                {socials.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`p-3 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-lg hover:shadow-2xl transition-shadow relative overflow-hidden group`}
                      whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      title={s.label}
                    >
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                      <Icon size={22} className="relative z-10" />
                    </motion.a>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Info Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50">
              <motion.div
                className="text-4xl mb-3"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📧
              </motion.div>
              <h4 className="font-bold text-xl mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Contact</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Email:</strong> <a href="mailto:narensonu1520@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">narensonu1520@gmail.com</a>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Portfolio:</strong> <a href="https://narensj20.netlify.app/" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">narensj20.netlify.app</a>
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50">
              <motion.div
                className="text-4xl mb-3"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💼
              </motion.div>
              <h4 className="font-bold text-xl mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Projects & Interests</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                I'm passionate about building full-stack projects with clean UX, secure architectures, and efficient backend systems while exploring open-source tools and cybersecurity concepts.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Fun Quote */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <motion.p
            className="text-lg italic text-gray-600 dark:text-gray-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            "Code is poetry, design is art, and together they create magic." 
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutDeveloperPage;