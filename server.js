const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let blacklist = [];

app.use((req, res, next) => {
    if (blacklist.includes(req.ip)) {
        console.log(`[FIREWALL] 🛑 Dropped malicious request from ${req.ip}`);
        return res.status(403).send('Access Denied: Blocked by AI Firewall');
    }
    next();
});

app.get('/', (req, res) => {
    console.log(`[${new Date().toISOString()}] ✅ Traffic received from ${req.ip}`);
    res.send('Cloud Node is running optimally.');
});

app.post('/api/block', (req, res) => {
    const maliciousIp = req.body.ip;
    
    if (maliciousIp && !blacklist.includes(maliciousIp)) {
        blacklist.push(maliciousIp);
        console.log(`\n🚨 [AI COMMAND RECEIVED] Blacklisting Attacker IP: ${maliciousIp}\n`);
    }
    res.json({ success: true, message: 'IP Blocked' });
});

app.post('/api/reset', (req, res) => {
    blacklist = [];
    console.log('\n🔄 [FIREWALL RESET] All IP blocks have been cleared for a new simulation.\n');
    res.json({ success: true, message: 'Firewall reset' });
});

app.listen(PORT, () => {
    console.log(`Victim Cloud Server with Active Firewall listening on port ${PORT}`);
});