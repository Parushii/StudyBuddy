import json
import numpy as np
from flask import Flask, request, jsonify
from collections import defaultdict
from PyPDF2 import PdfReader
from docx import Document
from utils import embed

app = Flask(__name__)

with open("syllabus_embeddings.json", "r", encoding="utf-8") as f:
    SYLLABUS = json.load(f)

SUBJECT_EMB = defaultdict(list)

for row in SYLLABUS:
    SUBJECT_EMB[row["subject"]].append(np.array(row["embedding"]))

SUBJECT_EMB = {
    s: np.mean(v, axis=0)
    for s, v in SUBJECT_EMB.items()
}

def cosine(a, b):
    return float(np.dot(a, b))

def chunk_text(text, max_words=300):
    words = text.split()
    return [{"text": " ".join(words[i:i+max_words])}
            for i in range(0, len(words), max_words)]

def extract_text(file):
    name = file.filename.lower()

    if name.endswith(".txt"):
        return file.read().decode("utf-8", errors="ignore")

    if name.endswith(".pdf"):
        reader = PdfReader(file)
        return "\n".join(p.extract_text() or "" for p in reader.pages)

    if name.endswith(".docx"):
        doc = Document(file)
        return "\n".join(p.text for p in doc.paragraphs)

    return None

def get_top_k_chunks(chunks, subject, k=3):
    scored = []

    subject_emb = SUBJECT_EMB[subject]

    for c in chunks:
        emb = embed(c["text"])
        score = cosine(emb, subject_emb)
        scored.append((score, c))

    scored.sort(reverse=True, key=lambda x: x[0])
    return [c for _, c in scored[:k]]

def classify_subject(chunks):
    scores = defaultdict(list)

    for c in chunks:
        emb = embed(c["text"])
        for subject, s_emb in SUBJECT_EMB.items():
            scores[subject].append(cosine(emb, s_emb))

    avg = {k: np.mean(v) for k, v in scores.items()}
    best = max(avg, key=avg.get)

    print("Subject scores:", avg)

    return best if avg[best] > 0.15 else None

def classify_unit(subject, chunks):
    top_chunks = get_top_k_chunks(chunks, subject, k=3)

    scores = defaultdict(list)

    for c in top_chunks:
        emb = embed(c["text"])

        for row in SYLLABUS:
            if row["subject"] != subject:
                continue

            key = (row["unit"], row["title"])
            scores[key].append(cosine(emb, row["embedding"]))

    if not scores:
        return None

    avg = {k: np.mean(v) for k, v in scores.items()}
    best = max(avg, key=avg.get)

    return {
        "unit": best[0],
        "title": best[1],
        "confidence": round(avg[best], 3)
    }

@app.route("/classify", methods=["POST"])
def classify():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    text = extract_text(request.files["file"])
    if not text:
        return jsonify({"error": "Empty file"}), 400

    chunks = chunk_text(text)

    subject = classify_subject(chunks)
    if subject is None:
        return jsonify({"subject": None, "unit": None})

    unit = classify_unit(subject, chunks)

    return jsonify({
        "subject": subject,
        "unit": unit["unit"] if unit else None,
        "unit_title": unit["title"] if unit else None,
        "confidence": unit["confidence"] if unit else None
    })

if __name__ == "__main__":
    app.run(port=8000, debug=True)

