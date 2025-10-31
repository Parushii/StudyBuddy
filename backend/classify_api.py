from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import joblib
from PyPDF2 import PdfReader
from docx import Document

app = Flask(__name__)

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("subject_model")
model = AutoModelForSequenceClassification.from_pretrained("subject_model")
label_encoder = joblib.load("label_encoder.pkl")

def extract_text_from_file(file):
    """Reads text content based on file type."""
    filename = file.filename.lower()

    if filename.endswith(".txt"):
        print("Reading TXT file")
        return file.read().decode("utf-8", errors="ignore")

    elif filename.endswith(".pdf"):
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text

    elif filename.endswith(".docx"):
        doc = Document(file)
        return "\n".join([para.text for para in doc.paragraphs])

    else:
        return None  # unsupported file

@app.route("/classify", methods=["POST"])
def classify():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    print("🔹 File received:", file.filename)
    print("🔹 Content type:", file.content_type)

    text = extract_text_from_file(file)

    if not text:
        print("❌ No text extracted or unsupported file")
        return jsonify({"error": "Unsupported file format"}), 400

    text = text[:2000]
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
        predicted_label = torch.argmax(outputs.logits, dim=1).item()

    predicted_subject = label_encoder.inverse_transform([predicted_label])[0]
    return jsonify({"subject": predicted_subject})



if __name__ == "__main__":
    app.run(port=8000)
