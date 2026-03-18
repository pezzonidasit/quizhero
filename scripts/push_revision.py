#!/usr/bin/env python
"""Push revision question sets to QuizHero's Firebase Realtime Database."""

import argparse
import json
import os
import sys
import uuid
from datetime import datetime

try:
    import firebase_admin
    from firebase_admin import credentials, db
except ImportError:
    print("ERROR: firebase-admin not installed. Run: pip install firebase-admin")
    sys.exit(1)

FIREBASE_DB_URL = "https://quiz-app-e738b-default-rtdb.europe-west1.firebasedatabase.app"
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def init_firebase():
    """Initialize Firebase Admin SDK (service account file or application default)."""
    if firebase_admin._apps:
        return  # already initialized

    sa_path = os.path.join(PROJECT_ROOT, "firebase-sa.json")
    if os.path.isfile(sa_path):
        cred = credentials.Certificate(sa_path)
        print(f"[OK] Firebase credentials loaded from {sa_path}")
    else:
        cred = credentials.ApplicationDefault()
        print("[OK] Firebase credentials loaded from application default")

    firebase_admin.initialize_app(cred, {"databaseURL": FIREBASE_DB_URL})


def generate_set_id():
    """Generate a unique set ID: rev_YYYYMMDD_HHMMSS_6hexchars."""
    now = datetime.now()
    hex_suffix = uuid.uuid4().hex[:6]
    return f"rev_{now.strftime('%Y%m%d_%H%M%S')}_{hex_suffix}"


def load_questions(file_path):
    """Load and validate questions JSON file."""
    if not os.path.isfile(file_path):
        print(f"ERROR: File not found: {file_path}")
        sys.exit(1)

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list) or len(data) == 0:
        print("ERROR: JSON must be a non-empty array of question objects")
        sys.exit(1)

    return data


def format_questions(raw_questions):
    """Format questions as {q000: {...}, q001: {...}, ...}."""
    formatted = {}
    for i, q in enumerate(raw_questions):
        key = f"q{i:03d}"
        entry = {
            "type": q.get("type", "text"),
            "text": q["text"],
            "answer": q["answer"],
        }
        if "choices" in q:
            entry["choices"] = q["choices"]
        if "acceptedAnswers" in q:
            entry["acceptedAnswers"] = q["acceptedAnswers"]
        if "hint" in q:
            entry["hint"] = q["hint"]
        if "explanation" in q:
            entry["explanation"] = q["explanation"]
        formatted[key] = entry
    return formatted


def push_revision_set(title, subject, groups, questions, created_by):
    """Push a revision set to Firebase and activate it for groups."""
    set_id = generate_set_id()
    formatted_qs = format_questions(questions)

    # Build the revision set payload
    payload = {
        "title": title,
        "subject": subject,
        "createdBy": created_by,
        "createdAt": {".sv": "timestamp"},
        "questionCount": len(questions),
        "questions": formatted_qs,
    }

    # Push to /revisionSets/{setId}
    ref = db.reference(f"/revisionSets/{set_id}")
    ref.set(payload)
    print(f"[OK] Pushed revision set: /revisionSets/{set_id} ({len(questions)} questions)")

    # Activate for each group
    group_codes = [g.strip() for g in groups if g.strip()]
    for group_code in group_codes:
        group_ref = db.reference(f"/groups/{group_code}/activeRevisions/{set_id}")
        group_ref.set(True)
        print(f"[OK] Activated for group: /groups/{group_code}/activeRevisions/{set_id}")

    print(f"\nDone. Set ID: {set_id}")
    return set_id


def main():
    parser = argparse.ArgumentParser(description="Push revision questions to QuizHero Firebase")
    parser.add_argument("--title", required=True, help="Revision set title (e.g. 'Allemand — Lektion 5')")
    parser.add_argument("--subject", required=True, choices=["francais", "allemand"], help="Subject")
    parser.add_argument("--groups", required=True, help="Comma-separated group codes (e.g. GRP_ABC,GRP_DEF)")
    parser.add_argument("--file", required=True, help="Path to questions JSON file")
    parser.add_argument("--created-by", default="vincent", help="Creator name (default: vincent)")
    args = parser.parse_args()

    group_list = [g.strip() for g in args.groups.split(",")]

    print(f"Title:   {args.title}")
    print(f"Subject: {args.subject}")
    print(f"Groups:  {group_list}")
    print(f"File:    {args.file}")
    print(f"Author:  {args.created_by}")
    print()

    questions = load_questions(args.file)
    print(f"[OK] Loaded {len(questions)} questions from {args.file}")

    init_firebase()
    push_revision_set(args.title, args.subject, group_list, questions, args.created_by)


if __name__ == "__main__":
    main()
