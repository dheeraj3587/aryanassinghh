import React from "react";
import { motion } from "framer-motion";

export function LoadingAnimation({ size = "w-20 h-20" }: { size?: string }) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className={`relative ${size}`}>
        {/* Central orb */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}>
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 shadow-lg shadow-purple-500/50" />
        </motion.div>

        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 border-2 border-white/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}>
          {/* Orbiting particles */}
          {[0, 120, 240].map((rotation, index) => (
            <motion.div
              key={index}
              className="absolute w-2 h-2 bg-white/40 rounded-full"
              style={{
                top: "50%",
                left: "50%",
                transformOrigin: "0 0",
              }}
              animate={{
                rotate: [rotation, rotation + 360],
                x: [-1, -1],
                y: [-1, -1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 border border-purple-400/30 rounded-full"
          animate={{ rotate: -360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}>
          {/* Inner orbiting elements */}
          {[0, 180].map((rotation, index) => (
            <motion.div
              key={index}
              className="absolute w-1.5 h-1.5 bg-purple-400/60 rounded-full"
              style={{
                top: "50%",
                left: "50%",
                transformOrigin: "0 0",
              }}
              animate={{
                rotate: [rotation, rotation - 360],
                x: [-0.75, -0.75],
                y: [-0.75, -0.75],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.5,
              }}
            />
          ))}
        </motion.div>

        {/* Floating particles */}
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={`particle-${index}`}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [-4, 4, -4],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.3,
            }}
          />
        ))}

        {/* Pulsing glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-500/10"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
