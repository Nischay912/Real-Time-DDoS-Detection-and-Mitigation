import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import random

print("Generating synthetic network traffic data...")

data = []
for _ in range(500):
    pps = random.randint(1, 20)
    data.append([pps, 0])

for _ in range(500):
    pps = random.randint(150, 5000) 
    data.append([pps, 1])

df = pd.DataFrame(data, columns=['PacketsPerSecond', 'IsAttack'])

X = df[['PacketsPerSecond']]
y = df['IsAttack']

print("Training Random Forest Classifier...")
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X.values, y.values)

joblib.dump(model, 'ddos_model.pkl')

print("Model training complete! Saved as 'ddos_model.pkl'")