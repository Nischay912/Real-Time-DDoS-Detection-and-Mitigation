from scapy.all import sniff, IP, TCP
import time
import joblib
from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
import threading
import requests

app = Flask(__name__)
# CRITICAL: This allows React to talk to Python without "Reset Failed"
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

model = joblib.load('ddos_model.pkl')
packet_count = 0
start_time = time.time()
blocked_ips = set()

def process_packet(packet):
    global packet_count, start_time, blocked_ips
    
    if IP in packet and TCP in packet:
        if packet[TCP].dport == 3000:
            packet_count += 1
            src_ip = packet[IP].src
            
            current_time = time.time()
            if current_time - start_time >= 2.0:
                pps = packet_count / 2.0 
                prediction = model.predict([[pps]])[0]
                
                is_blocked = src_ip in blocked_ips
                
                if prediction == 1 and not is_blocked:
                    status = "Attack"
                    print(f"[{time.strftime('%H:%M:%S')}] 🚨 ATTACK: {src_ip} ({pps} pps)")
                    blocked_ips.add(src_ip)
                    # Tell Node.js to block
                    try:
                        requests.post('http://127.0.0.1:3000/api/block', json={'ip': src_ip}, timeout=1)
                        requests.post('http://127.0.0.1:3000/api/block', json={'ip': f'::ffff:{src_ip}'}, timeout=1)
                    except: pass
                elif prediction == 1 and is_blocked:
                    status = "Mitigated"
                    print(f"[{time.strftime('%H:%M:%S')}] 🛡️ MITIGATED: {src_ip} blocked.")
                else:
                    status = "Normal"
                    print(f"[{time.strftime('%H:%M:%S')}] ✅ Normal ({pps} pps)")

                socketio.emit('traffic_update', {'time': time.strftime('%H:%M:%S'), 'pps': pps, 'status': status})
                packet_count = 0
                start_time = current_time

# This route MUST exist for the "Reset Firewall" button to work
@app.route('/api/python_reset', methods=['POST', 'OPTIONS'])
def python_reset():
    if request.method == 'OPTIONS': return jsonify({'success': True})
    global blocked_ips
    blocked_ips.clear()
    print("\n🔄 FIREWALL RESET: AI Memory Cleared.\n")
    return jsonify({'success': True})

def start_sniffer():
    print("Sniffer Active...")
    sniff(filter="tcp port 3000", prn=process_packet, store=0, iface="Software Loopback Interface 1")

if __name__ == '__main__':
    threading.Thread(target=start_sniffer, daemon=True).start()
    socketio.run(app, port=5000, allow_unsafe_werkzeug=True)