# This Python script is a part of a Smart AI Assistant project for a final year college project. It is
# a model training script that trains a simple intent classifier using TF-IDF Vectorization and either
# Logistic Regression or Random Forest algorithms. The script then evaluates the models using
# accuracy, precision, and recall metrics.
"""
Smart AI Assistant - ML Model Training Script
Final Year College Project

This script trains a simple intent classifier using:
- TF-IDF Vectorization
- Logistic Regression / Random Forest
- Evaluation with accuracy, precision, recall

Run: python training/train_model.py
"""

import json
import pickle
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline

# ---- Load Dataset ----
dataset_path = os.path.join(os.path.dirname(__file__), "intents.json")

with open(dataset_path, "r", encoding="utf-8") as f:
    data = json.load(f)

X = []  # texts
y = []  # labels (intents)

for intent in data["intents"]:
    for pattern in intent["patterns"]:
        X.append(pattern.lower())
        y.append(intent["tag"])

print(f"✅ Dataset loaded: {len(X)} examples, {len(set(y))} intents")
print(f"   Intents: {sorted(set(y))}\n")

# ---- Train/Test Split ----
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ---- Model 1: Logistic Regression Pipeline ----
print("🤖 Training Logistic Regression model...")
lr_pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=5000)),
    ("clf",   LogisticRegression(max_iter=500, C=10))
])
lr_pipeline.fit(X_train, y_train)
lr_pred = lr_pipeline.predict(X_test)
lr_acc  = accuracy_score(y_test, lr_pred)
print(f"   Logistic Regression Accuracy: {lr_acc:.2%}")

# ---- Model 2: Random Forest Pipeline ----
print("\n🌳 Training Random Forest model...")
rf_pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=5000)),
    ("clf",   RandomForestClassifier(n_estimators=100, random_state=42))
])
rf_pipeline.fit(X_train, y_train)
rf_pred = rf_pipeline.predict(X_test)
rf_acc  = accuracy_score(y_test, rf_pred)
print(f"   Random Forest Accuracy: {rf_acc:.2%}")

# ---- Choose Best Model ----
best_model = lr_pipeline if lr_acc >= rf_acc else rf_pipeline
best_name  = "Logistic Regression" if lr_acc >= rf_acc else "Random Forest"
best_acc   = max(lr_acc, rf_acc)
print(f"\n🏆 Best Model: {best_name} ({best_acc:.2%} accuracy)")

# ---- Detailed Report ----
print("\n📊 Classification Report:")
print(classification_report(y_test, best_model.predict(X_test), zero_division=0))

# ---- Save Model ----
output_dir = os.path.join(os.path.dirname(__file__), "../backend/models")
os.makedirs(output_dir, exist_ok=True)

model_path = os.path.join(output_dir, "chatbot_model.pkl")
with open(model_path, "wb") as f:
    pickle.dump({"model": best_model, "name": best_name, "accuracy": best_acc}, f)

print(f"\n✅ Model saved to: {model_path}")

# ---- Test Predictions ----
print("\n🧪 Sample Predictions:")
test_inputs = [
    "hello there",
    "I have a headache",
    "best laptop under 50000",
    "write python code",
    "namaste kaise ho",
    "explain machine learning",
]
for text in test_inputs:
    intent = best_model.predict([text.lower()])[0]
    proba  = best_model.predict_proba([text.lower()]).max()
    print(f"   '{text}' → {intent} ({proba:.0%} confidence)")

print("\n🎉 Training complete!")
