import json
import pandas as pd
from sklearn.model_selection import train_test_split

# Load your dataset
with open("data.json") as f:
    data = json.load(f)

df = pd.DataFrame(data)

# We'll start with subject classification
train_texts, test_texts, train_labels, test_labels = train_test_split(
    df["text"], df["subject"], test_size=0.2, random_state=42
)

from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("allenai/longformer-base-4096")


train_encodings = tokenizer(list(train_texts), truncation=True, padding=True)
test_encodings = tokenizer(list(test_texts), truncation=True, padding=True)

from sklearn.preprocessing import LabelEncoder
import torch

label_encoder = LabelEncoder()
train_labels_enc = label_encoder.fit_transform(train_labels)
test_labels_enc = label_encoder.transform(test_labels)

class NotesDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

train_dataset = NotesDataset(train_encodings, train_labels_enc)
test_dataset = NotesDataset(test_encodings, test_labels_enc)


from transformers import AutoModelForSequenceClassification, Trainer, TrainingArguments

model = AutoModelForSequenceClassification.from_pretrained(
    "allenai/longformer-base-4096",
    num_labels=len(label_encoder.classes_)
)


training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    num_train_epochs=10,
    weight_decay=0.01,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
)

trainer.train()

preds_output = trainer.predict(test_dataset)
pred_labels = preds_output.predictions.argmax(axis=1)

from sklearn.metrics import classification_report

import numpy as np

print(classification_report(
    test_labels_enc,
    pred_labels,
    labels=np.arange(len(label_encoder.classes_)),
    target_names=label_encoder.classes_,
    zero_division=0
))



def predict_subject(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    pred = torch.argmax(outputs.logits, dim=1).item()
    return label_encoder.inverse_transform([pred])[0]

print(predict_subject("Light travels in straight lines and reflects from mirrors."))
