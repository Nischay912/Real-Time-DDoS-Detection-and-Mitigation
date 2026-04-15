const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to read JSON data
app.use(express.json());

// Our active Firewall Blacklist
let blacklist = [];

// 1. THE FIREWALL: This checks every single incoming request
app.use((req, res, next) => {
    // If the sender's IP is on the blacklist, drop the packet
    if (blacklist.includes(req.ip)) {
        // We log it so you can see the firewall working in the terminal
        console.log(`[FIREWALL] 🛑 Dropped malicious request from ${req.ip}`);
        return res.status(403).send('Access Denied: Blocked by AI Firewall');
    }
    // Otherwise, let the traffic through
    next();
});

// 2. THE NORMAL ROUTE: What normal users see
app.get('/', (req, res) => {
    console.log(`[${new Date().toISOString()}] ✅ Traffic received from ${req.ip}`);
    res.send('Cloud Node is running optimally.');
});

// 3. THE SECRET AI ROUTE: Our Python sniffer will call this to add IPs to the blacklist
app.post('/api/block', (req, res) => {
    const maliciousIp = req.body.ip;
    
    if (maliciousIp && !blacklist.includes(maliciousIp)) {
        blacklist.push(maliciousIp);
        console.log(`\n🚨 [AI COMMAND RECEIVED] Blacklisting Attacker IP: ${maliciousIp}\n`);
    }
    res.json({ success: true, message: 'IP Blocked' });
});

// 4. THE RESET ROUTE: Clears the firewall instantly from the dashboard
app.post('/api/reset', (req, res) => {
    blacklist = [];
    console.log('\n🔄 [FIREWALL RESET] All IP blocks have been cleared for a new simulation.\n');
    res.json({ success: true, message: 'Firewall reset' });
});

app.listen(PORT, () => {
    console.log(`Victim Cloud Server with Active Firewall listening on port ${PORT}`);
});