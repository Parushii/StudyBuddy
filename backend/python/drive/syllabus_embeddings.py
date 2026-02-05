import json
from StudyBuddy.backend.python.drive.utils import embed

with open("syllabus/syllabus.json", "r", encoding="utf-8") as f:
    syllabus = json.load(f)

rows = []

for subject, data in syllabus.items():
    for unit in data["units"]:
        text = f"{subject}. {unit['title']}. {unit['description']}"

        rows.append({
            "subject": subject,
            "unit": unit["unit"],
            "title": unit["title"],
            "embedding": embed(text).tolist()
        })

with open("syllabus_embeddings.json", "w", encoding="utf-8") as f:
    json.dump(rows, f, indent=2)

print("syllabus_embeddings.json generated")
