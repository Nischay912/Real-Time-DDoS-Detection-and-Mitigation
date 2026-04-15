import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import random

print("Generating synthetic network traffic data...")

# Create empty lists to hold our data
data = []

# 1. Generate NORMAL traffic (Label 0)
# Normal traffic usually has low packets per second (PPS)
for _ in range(500):
    pps = random.randint(1, 20) # 1 to 20 packets per second
    data.append([pps, 0])

# 2. Generate DDoS ATTACK traffic (Label 1)
# Attacks have massive spikes in PPS
for _ in range(500):
    pps = random.randint(150, 5000) # 150 to 5000 packets per second
    data.append([pps, 1])

# Convert to a DataFrame
df = pd.DataFrame(data, columns=['PacketsPerSecond', 'IsAttack'])

# Split into Features (X) and Labels (y)
X = df[['PacketsPerSecond']]
y = df['IsAttack']

print("Training Random Forest Classifier...")
# Initialize and train the ML model
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X.values, y.values)

# Save the trained model to a file so our sniffer can use it
joblib.dump(model, 'ddos_model.pkl')

print("Model training complete! Saved as 'ddos_model.pkl'")