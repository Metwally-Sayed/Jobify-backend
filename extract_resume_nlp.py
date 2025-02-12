import json
import re
import sys

import spacy

# Load spaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Load resume text from file
resume_text_path = sys.argv[1]
with open(resume_text_path, "r", encoding="utf-8") as file:
    text = file.read()

# Apply NLP
doc = nlp(text)

# Extract name using spaCy NER
name = "Not Found"
for ent in doc.ents:
    if ent.label_ == "PERSON":
        name = ent.text
        break

# Extract email using regex
email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
email = email_match.group() if email_match else "Not Found"

# Extract phone number using regex
phone_match = re.search(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}\b", text)
phone = phone_match.group() if phone_match else "Not Found"

# Extract location using spaCy NER (Geopolitical Entities)
location = "Not Found"
for ent in doc.ents:
    if ent.label_ == "GPE":  # GPE = Geopolitical Entity (City, State, Country)
        location = ent.text
        break

# Fallback regex-based location extraction
if location == "Not Found":
    location_match = re.search(r"\b[A-Z][a-z]+(?:, [A-Z]{2}|, [A-Z][a-z]+)?\b", text)
    location = location_match.group() if location_match else "Not Found"

# Output results
result = {
    "name": name,
    "email": email,
    "phone": phone,
    "location": location
}

print(json.dumps(result))
