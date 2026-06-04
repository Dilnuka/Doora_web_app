"use client";
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, Play, Save, ChevronDown, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TOGGLE_OPTIONS = {
  power: [
    { label: 'Turn On', value: 'on', color: '#eab308' },
    { label: 'Turn Off', value: 'off', color: '#64748b' },
    { label: 'Ignore', value: 'ignore', color: 'transparent' }
  ],
  shade: [
    { label: 'Open', value: 'open', color: '#3b82f6' },
    { label: 'Close', value: 'close', color: '#64748b' },
    { label: 'Ignore', value: 'ignore', color: 'transparent' }
  ],
  ac: [
    { label: 'Turn On', value: 'on', color: '#3b82f6' },
    { label: 'Turn Off', value: 'off', color: '#ef4444' },
    { label: 'Ignore', value: 'ignore', color: 'transparent' }
  ],
  lock: [
    { label: 'Lock', value: 'lock', color: '#ef4444' },
    { label: 'Unlock', value: 'unlock', color: '#10b981' },
    { label: 'Ignore', value: 'ignore', color: 'transparent' }
  ]
};

const CATEGORIES = [
  {
    title: "Lighting",
    id: "lighting",
    items: [
      { key: "light_master", label: "Master Light", type: "toggle", options: TOGGLE_OPTIONS.power },
      { key: "light_kitchen", label: "Kitchen Lights", type: "toggle", options: TOGGLE_OPTIONS.power },
      { key: "light_bath", label: "Bathroom Lights", type: "toggle", options: TOGGLE_OPTIONS.power },
      { key: "light_bed", label: "Bedroom Lights", type: "toggle", options: TOGGLE_OPTIONS.power },
      { key: "light_living", label: "Living Room Lights", type: "toggle", options: TOGGLE_OPTIONS.power },
    ]
  },
  {
    title: "Shades & Windows",
    id: "shades",
    items: [
      { key: "curtains_bed", label: "Bedroom Curtains", type: "toggle", options: TOGGLE_OPTIONS.shade },
      { key: "curtains_living", label: "Living Room Curtains", type: "toggle", options: TOGGLE_OPTIONS.shade },
      { key: "window_bed", label: "Bedroom Window", type: "toggle", options: TOGGLE_OPTIONS.shade },
      { key: "window_living", label: "Living Room Window", type: "toggle", options: TOGGLE_OPTIONS.shade },
    ]
  },
  {
    title: "Climate",
    id: "climate",
    items: [
      { key: "ac_power", label: "AC Power", type: "toggle", options: TOGGLE_OPTIONS.ac },
      { key: "ac_temp", label: "AC Temperature", type: "number", min: 16, max: 30, dependsOn: "ac_power", dependsNot: "off" }
    ]
  },
  {
    title: "Media & Security",
    id: "media",
    items: [
      { key: "tv", label: "Television", type: "toggle", options: TOGGLE_OPTIONS.ac },
      { key: "door", label: "Main Door", type: "toggle", options: TOGGLE_OPTIONS.lock },
    ]
  }
];

const ActionToggle = ({ label, value, options, onChange, disabled }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto', padding: '4px 0' }}>
    <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{label}</span>
    <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
      {options.map(opt => {
        const isSelected = (value || 'ignore') === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: isSelected && opt.value !== 'ignore' ? 'none' : '1px solid transparent',
              fontSize: '12px',
              cursor: 'pointer',
              background: isSelected ? opt.color : 'transparent',
              color: isSelected ? (opt.value === 'ignore' ? '#94a3b8' : 'white') : '#64748b',
              transition: 'all 0.2s',
              fontWeight: isSelected ? 'bold' : 'normal'
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

export default function SmartRoutinesModal({ isOpen, onClose, onTrigger }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [triggerPhrase, setTriggerPhrase] = useState("");
  const [actions, setActions] = useState({});
  const [expandedCategory, setExpandedCategory] = useState("lighting");

  useEffect(() => {
    if (isOpen) {
      fetchRoutines();
    }
  }, [isOpen]);

  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/routines");
      if (res.ok) {
        const data = await res.json();
        setRoutines(data.routines || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (routine) => {
    setEditingId(routine.id);
    setTriggerPhrase(routine.triggerPhrase);
    
    // Migrate legacy action keys to the new CATEGORIES format
    const migratedActions = {};
    for (const [k, v] of Object.entries(routine.actions)) {
      if (k === 'lights') {
        migratedActions['light_master'] = v;
        migratedActions['light_living'] = v;
        migratedActions['light_kitchen'] = v;
        migratedActions['light_bath'] = v;
        migratedActions['light_bed'] = v;
      } else if (k === 'curtains') {
        migratedActions['curtains_living'] = v;
        migratedActions['curtains_bed'] = v;
      } else if (k.includes(' ')) {
        migratedActions[k.replace(' ', '_')] = v;
      } else {
        migratedActions[k] = v;
      }
    }
    setActions(migratedActions);
    setExpandedCategory("lighting");
  };

  const startCreate = () => {
    setEditingId("new");
    setTriggerPhrase("");
    setActions({});
    setExpandedCategory("lighting");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTriggerPhrase("");
    setActions({});
  };

  const saveRoutine = async () => {
    try {
      // Clean up ignored or empty values
      const cleanActions = { ...actions };
      Object.keys(cleanActions).forEach(k => {
        if (cleanActions[k] === "ignore" || cleanActions[k] === undefined) {
          delete cleanActions[k];
        }
      });

      const payload = { triggerPhrase, actions: cleanActions };
      
      // Prevent saving entirely empty actions if they just deleted everything
      if (Object.keys(cleanActions).length === 0) {
        alert("Please add at least one action to this routine.");
        return;
      }

      let res;
      if (editingId === "new") {
        res = await fetch("/api/routines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`/api/routines/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      if (res.ok) {
        cancelEdit();
        fetchRoutines();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRoutine = async (id) => {
    if (!confirm("Are you sure you want to delete this routine?")) return;
    try {
      const res = await fetch(`/api/routines/${id}`, { method: "DELETE" });
      if (res.ok) fetchRoutines();
    } catch (err) {
      console.error(err);
    }
  };

  const handleActionChange = (key, value) => {
    setActions(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'ac_power' && value === 'off') {
        delete next['ac_temp'];
      }
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ width: '650px', maxHeight: '85vh', background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: '600' }}>Smart Routines</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}><X size={24} /></button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: '40px 0' }}>Loading routines...</p>
          ) : editingId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Trigger Phrase</label>
                <input 
                  value={triggerPhrase} 
                  onChange={e => setTriggerPhrase(e.target.value)}
                  placeholder="e.g. Good Morning"
                  style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '16px', outline: 'none', transition: 'border 0.2s' }}
                  onFocus={e=>e.currentTarget.style.border='1px solid #3b82f6'}
                  onBlur={e=>e.currentTarget.style.border='1px solid rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <h4 style={{ margin: '0 0 12px 0', color: 'white', fontSize: '16px', fontWeight: '500' }}>Actions Settings</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {CATEGORIES.map(cat => (
                    <div key={cat.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                      <div 
                        onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                        style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedCategory === cat.id ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                      >
                        <span style={{ color: 'white', fontWeight: '500' }}>{cat.title}</span>
                        {expandedCategory === cat.id ? <ChevronDown size={18} color="#94a3b8" /> : <ChevronRight size={18} color="#94a3b8" />}
                      </div>
                      <AnimatePresence>
                        {expandedCategory === cat.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {cat.items.map(item => {
                                const disabled = item.dependsOn && actions[item.dependsOn] === item.dependsNot;
                                
                                if (item.type === 'toggle') {
                                  return (
                                    <ActionToggle 
                                      key={item.key} 
                                      label={item.label} 
                                      value={actions[item.key]} 
                                      options={item.options} 
                                      onChange={val => handleActionChange(item.key, val)}
                                      disabled={disabled}
                                    />
                                  );
                                }
                                
                                if (item.type === 'number') {
                                  return (
                                    <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: disabled ? 0.3 : 1, pointerEvents: disabled ? 'none' : 'auto', transition: 'opacity 0.2s', padding: '4px 0' }}>
                                      <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{item.label}</span>
                                      <input 
                                        type="number" 
                                        min={item.min} 
                                        max={item.max} 
                                        value={actions[item.key] || ""} 
                                        placeholder="e.g. 22" 
                                        onChange={e => handleActionChange(item.key, e.target.value ? parseInt(e.target.value) : undefined)} 
                                        disabled={disabled} 
                                        style={{ width: '80px', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', outline: 'none' }} 
                                      />
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={saveRoutine} disabled={!triggerPhrase} style={{ flex: 1, padding: '14px', background: !triggerPhrase ? '#1e293b' : '#3b82f6', color: !triggerPhrase ? '#64748b' : 'white', border: 'none', borderRadius: '12px', cursor: !triggerPhrase ? 'not-allowed' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                  <Save size={18} /> Save Routine
                </button>
                <button onClick={cancelEdit} style={{ padding: '14px 24px', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {routines.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', transition: 'transform 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '18px', fontWeight: '500' }}>"{r.triggerPhrase}"</h3>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {Object.keys(r.actions).length === 0 ? (
                        <span style={{ color: '#64748b', fontSize: '12px' }}>No actions configured</span>
                      ) : (
                        Object.entries(r.actions).map(([k,v]) => {
                          // Normalize for display
                          let displayKey = k.replace('_', ' ');
                          if (k === 'lights') displayKey = 'all lights';
                          if (k === 'curtains') displayKey = 'all curtains';
                          return (
                            <span key={k} style={{ padding: '2px 8px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: '4px', fontSize: '11px', textTransform: 'capitalize' }}>
                              {displayKey}: {v}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => onTrigger && onTrigger(r.triggerPhrase)} title="Test Routine" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(16, 185, 129, 0.25)'} onMouseOut={e=>e.currentTarget.style.background='rgba(16, 185, 129, 0.15)'}><Play size={18} /></button>
                    <button onClick={() => startEdit(r)} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(59, 130, 246, 0.25)'} onMouseOut={e=>e.currentTarget.style.background='rgba(59, 130, 246, 0.15)'}><Edit2 size={18} /></button>
                    <button onClick={() => deleteRoutine(r.id)} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(239, 68, 68, 0.25)'} onMouseOut={e=>e.currentTarget.style.background='rgba(239, 68, 68, 0.15)'}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}

              <button onClick={startCreate} style={{ marginTop: '16px', padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '16px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';}} onMouseOut={e => {e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';}}>
                <Plus size={20} /> Create Custom Routine
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
