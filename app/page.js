"use client";
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { LogOut, Smartphone, Monitor, Cpu, Radio, Shield, Zap } from 'lucide-react';
import { useSimulation } from '@/context/SimulationContext';
import ParticleNetwork from '@/components/ParticleNetwork';
import { motion } from 'framer-motion';

export default function Home() {
  const { data: session } = useSession();
  const { signOutAndSave } = useSimulation();

  // Animation variants for entering elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const cardA = {
    hover: {
      y: -6,
      borderColor: "rgba(139, 92, 246, 0.4)",
      boxShadow: "0 15px 30px -10px rgba(139, 92, 246, 0.25)",
      transition: { duration: 0.3 }
    }
  };

  const cardB = {
    hover: {
      y: -6,
      borderColor: "rgba(212, 175, 55, 0.4)",
      boxShadow: "0 15px 30px -10px rgba(212, 175, 55, 0.25)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <main className="landing-main" style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: '#050508',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'var(--font-inter), system-ui, sans-serif',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* Particle network background */}
      <ParticleNetwork />

      {/* Foreground Content */}
      <div className="landing-content" style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '1100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* Logout Button */}
        {session && (
          <div style={{ position: 'absolute', top: '-10px', right: '0px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{session.user.name || session.user.email}</span>
              <span style={{ fontSize: '11px', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.2)', padding: '1px 6px', borderRadius: '10px', marginTop: '2px' }}>{session.user.role}</span>
            </div>
            <button 
              onClick={() => signOutAndSave()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}

        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ textAlign: 'center', marginBottom: '28px', marginTop: session ? '32px' : '0px' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '4px 12px', borderRadius: '30px', marginBottom: '10px' }}>
            <Zap size={12} style={{ color: '#8b5cf6' }} />
            <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#a78bfa' }}>ENTERPRISE IoT PLATFORM</span>
          </div>

          <h1 style={{ 
            fontSize: 'calc(20px + 1.8vw)', 
            fontWeight: '800', 
            margin: '0 0 10px 0', 
            background: 'linear-gradient(135deg, #ffffff 30%, #c7d2fe 70%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            DOORA Enterprise Demo
          </h1>
          
          <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
            This system is split into two physically distinct applications communicating in real-time over a Cloud MQTT Broker.
          </p>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: '20px' }}>MQTT Protocol</span>
            <span style={{ fontSize: '10px', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: '20px' }}>Next.js 16</span>
            <span style={{ fontSize: '10px', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: '20px' }}>React 19</span>
            <span style={{ fontSize: '10px', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: '20px' }}>Prisma ORM</span>
          </div>
        </motion.div>

        {/* Node Selection Grid */}
        <motion.div 
          className="landing-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ 
            display: 'flex', 
            gap: '24px', 
            alignItems: 'stretch', 
            justifyContent: 'center', 
            width: '100%',
            flexWrap: 'wrap'
          }}
        >
          
          {/* Controller App Card */}
          <motion.div className="landing-card" variants={itemVariants} style={{ flex: '1 1 300px', maxWidth: '360px' }}>
            <Link href="/controller" style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
              <motion.div 
                variants={cardA}
                whileHover="hover"
                style={{ 
                  height: '100%',
                  background: 'rgba(20, 22, 28, 0.65)', 
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px', 
                  border: '1px solid rgba(139, 92, 246, 0.15)', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Image Container */}
                <div style={{ height: '130px', overflow: 'hidden', position: 'relative', margin: '6px', borderRadius: '14px' }}>
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    zIndex: 2,
                    background: 'rgba(139, 92, 246, 0.85)',
                    color: 'white',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    letterSpacing: '1px',
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                  }}>
                    NODE A • CONTROLLER
                  </div>
                  <motion.img 
                    src="/smart-home-control-panel33-1.jpg" 
                    alt="Smart Home Control Panel"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '50%',
                    background: 'linear-gradient(to top, rgba(20, 22, 28, 0.95) 0%, transparent 100%)',
                    zIndex: 1
                  }} />
                </div>

                {/* Info Container */}
                <div style={{ padding: '10px 18px 16px 18px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Smartphone size={18} style={{ color: '#8b5cf6' }} />
                      <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 'bold', color: '#ffffff' }}>Controller App</h2>
                    </div>
                    
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                      The Guest Mobile UI. Load this on your smartphone to send voice commands and interact with the room control dashboard.
                    </p>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: '10px',
                    marginTop: 'auto'
                  }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Cpu size={12} /> Mobile App UI
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* MQTT Broker Status Divider */}
          <motion.div 
            variants={itemVariants}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              flex: '1 1 180px',
              maxWidth: '200px',
              padding: '16px',
              background: 'rgba(255,255,255,0.01)',
              border: '1px dashed rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              alignSelf: 'center'
            }}
            className="pulse-element"
          >
            <Radio size={22} style={{ color: '#10b981', marginBottom: '8px' }} />
            <h4 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#64748b', margin: '0 0 6px 0', fontWeight: 'bold' }}>MQTT BROKER</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.08)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 6px #10b981', display: 'inline-block' }} />
              <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 'bold', letterSpacing: '0.5px' }}>ACTIVE BRIDGE</span>
            </div>

            <p style={{ color: '#475569', fontSize: '10px', textAlign: 'center', margin: '8px 0 0 0', lineHeight: '1.3' }}>
              Subscribed to room/+/status<br/>Publishing to room/+/command
            </p>
          </motion.div>

          {/* Visualization App Card */}
          <motion.div className="landing-card" variants={itemVariants} style={{ flex: '1 1 300px', maxWidth: '360px' }}>
            <Link href="/visualization" style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
              <motion.div 
                variants={cardB}
                whileHover="hover"
                style={{ 
                  height: '100%',
                  background: 'rgba(20, 22, 28, 0.65)', 
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px', 
                  border: '1px solid rgba(212, 175, 55, 0.15)', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Image Container */}
                <div style={{ height: '130px', overflow: 'hidden', position: 'relative', margin: '6px', borderRadius: '14px' }}>
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    zIndex: 2,
                    background: 'rgba(212, 175, 55, 0.85)',
                    color: '#000000',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    letterSpacing: '1px',
                    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
                  }}>
                    NODE B • VISUALIZATION
                  </div>
                  <motion.img 
                    src="/smart-homes-integrated-devices-1030x875.png" 
                    alt="Smart Homes Integrated Devices"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '50%',
                    background: 'linear-gradient(to top, rgba(20, 22, 28, 0.95) 0%, transparent 100%)',
                    zIndex: 1
                  }} />
                </div>

                {/* Info Container */}
                <div style={{ padding: '10px 18px 16px 18px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Monitor size={18} style={{ color: '#d4af37' }} />
                      <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 'bold', color: '#ffffff' }}>Visualization App</h2>
                    </div>
                    
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                      The Digital Twin Dashboard. Load this on your TV or laptop to view the live 3D state, alerts, logs, and integrated devices.
                    </p>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: '10px',
                    marginTop: 'auto'
                  }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={12} /> 3D Digital Twin TV
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

        </motion.div>

      </div>

      {/* Branding Footer */}
      <motion.div
        className="branding-footer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '8px 18px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          pointerEvents: 'auto'
        }}
      >
        <span style={{
          fontSize: '11px',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#64748b'
        }}>
          Developed By
        </span>
        <a 
          href="https://vsis.lk" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none'
          }}
        >
          <motion.img
            src="/Vector-scaled-Photoroom.png"
            alt="VSIS Logo"
            style={{
              height: '18px',
              width: 'auto',
              display: 'block'
            }}
            whileHover={{ 
              scale: 1.05,
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2)) brightness(1.1)'
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          />
        </a>
      </motion.div>
    </main>

  );
}

