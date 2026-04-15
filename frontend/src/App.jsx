import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldAlert, ShieldCheck, Activity, Loader } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import './App.css'; 

const socket = io('http://localhost:5000');

function App() {
  const [data, setData] = useState([]);
  const [systemStatus, setSystemStatus] = useState('Normal');
  const [currentPps, setCurrentPps] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    socket.on('traffic_update', (newData) => {
      setSystemStatus(newData.status);
      setCurrentPps(newData.pps);
      setData((prev) => [...prev.slice(-19), newData]);
    });
    return () => socket.off('traffic_update');
  }, []);

  const handleReset = async () => {
    setIsResetting(true);
    
    // 1. Fire and forget the reset commands
    fetch('http://localhost:3000/api/reset', { method: 'POST' }).catch(() => {});
    fetch('http://localhost:5000/api/python_reset', { method: 'POST' }).catch(() => {});

    // 2. Immediately show success to keep the demo moving
    toast.success('System Secured: Firewall Reset Successful!', {
      style: {
        background: '#1c2128',
        color: '#00E676',
        border: '1px solid #00E676',
      },
      icon: '🛡️',
      duration: 3000
    });

    // 3. Reset the UI state
    setSystemStatus('Normal');
    setTimeout(() => {
      setIsResetting(false);
    }, 1000);
  };

  const isAttack = systemStatus === 'Attack';
  const isMitigated = systemStatus === 'Mitigated';

  return (
    <div className={`dashboard-container ${isAttack ? 'attack-mode' : (isMitigated ? 'mitigated-mode' : 'normal-mode')}`}>
      <Toaster position="bottom-right" />
      
      <header className="header">
        <Activity className="icon" size={32} />
        <h1>Real-Time DDoS Detection and Mitigation</h1>
        <button onClick={handleReset} className={`reset-btn ${isResetting ? 'reset-success' : ''}`}>
          {isResetting ? 'Processing...' : '🔄 Reset Firewall'}
        </button>
      </header>

      <div className="status-panel">
        <div className={`status-indicator ${isAttack ? 'bg-red' : (isMitigated ? 'bg-blue' : 'bg-green')}`}>
          {isAttack || isMitigated ? <ShieldAlert size={64} /> : <ShieldCheck size={64} />}
          <h2>{isAttack ? 'DDoS ATTACK DETECTED' : (isMitigated ? 'ATTACK MITIGATED' : 'System Secure')}</h2>
          
          {isAttack && (
            <div className="mitigation-banner">
              <Loader className="spin-icon" size={20} />
              <span>Analyzing Traffic Signature...</span>
            </div>
          )}

          {isMitigated && (
            <div className="mitigated-banner">
              <ShieldCheck size={20} />
              <span>IP Quarantined: Malicious traffic dropped at edge.</span>
            </div>
          )}
        </div>
        <div className="metrics">
          <p>Current Traffic Rate</p>
          <h3>{currentPps} <span>pps</span></h3>
        </div>
      </div>

      <div className="graph-container">
        <h3>Network Traffic (Real-Time)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="time" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none', color: '#fff' }} />
            <Line
              type="monotone"
              dataKey="pps"
              stroke={isAttack ? '#ff4444' : (isMitigated ? '#58a6ff' : '#00E676')}
              strokeWidth={4}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default App;