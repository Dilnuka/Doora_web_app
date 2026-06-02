"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh', background: '#0a0b10', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 10px 0', background: 'linear-gradient(to right, #d4af37, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          DOORA Enterprise Demo
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          This system is split into two physically distinct applications communicating in real-time over a Cloud MQTT Broker.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        {/* Machine A Button */}
        <Link href="/controller" style={{ textDecoration: 'none' }}>
          <div style={{ width: '300px', padding: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '32px' }}>
              📱
            </div>
            <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'white' }}>Machine A</h2>
            <h3 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#8b5cf6' }}>Controller App</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              The Guest Mobile UI. Load this on your smartphone to send voice commands.
            </p>
          </div>
        </Link>

        {/* Machine B Button */}
        <Link href="/visualization" style={{ textDecoration: 'none' }}>
          <div style={{ width: '300px', padding: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(212, 175, 55, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '32px' }}>
              🖥️
            </div>
            <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'white' }}>Machine B</h2>
            <h3 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#d4af37' }}>Visualization App</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              The Digital Twin Dashboard. Load this on your TV/laptop to view live state.
            </p>
          </div>
        </Link>

      </div>
    </main>
  );
}
