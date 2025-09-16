import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

interface WelcomeSplashProps {
  onComplete: () => void;
}

export function WelcomeSplash({ onComplete }: WelcomeSplashProps) {
  const [count, setCount] = useState(1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1600; // 1.6s to reach 100

    const step = (t: number) => {
      const elapsed = t - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const value = Math.floor(1 + eased * 99);
      setCount(value);
      if (progress < 1) raf = requestAnimationFrame(step);
      else {
        setCount(100);
        setTimeout(() => setDone(true), 200);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[1000] bg-gradient-to-br from-neutral-950 via-blue-950 to-purple-950 text-white flex items-center justify-center">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: count === 100 ? 15 : 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="relative flex flex-col items-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* Count */}
            <span
              className="font-black tracking-tight select-none"
              style={{
                fontSize: "12rem",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                background:
                  "linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              {count}
            </span>

            {/* Brand Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                NewsFlow AI
              </h1>
              <p className="text-lg text-blue-200 mt-2 font-medium">
                Intelligent News Analysis
              </p>
            </motion.div>

            {/* Progress Bar */}
            <div className="absolute inset-x-0 -bottom-8 mx-auto h-1 w-80 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-purple-500/0 rounded-full" />

            {/* Sparkles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -right-4">
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
