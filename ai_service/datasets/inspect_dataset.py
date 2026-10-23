"""
Dataset Inspection and Exploratory Data Analysis (EDA) Script
Author: Nguyen Ngoc Sang (AI Lead)
Topic: Knowledge Tracing on Benchmark Educational Dataset
(Written with Python Standard Library - Zero external dependencies)
"""

import os
import csv

def inspect_dataset(csv_path):
    if not os.path.exists(csv_path):
        print(f"[ERROR] File not found: {csv_path}")
        return

    users = set()
    problems = set()
    skills = set()
    correct_count = 0
    total_records = 0
    sample_rows = []

    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            total_records += 1
            users.add(row['user_id'])
            problems.add(row['problem_id'])
            skills.add(row['skill_id'])
            if row['correct'] == '1':
                correct_count += 1
            if idx < 8:
                sample_rows.append(row)

    accuracy = (correct_count / total_records * 100) if total_records > 0 else 0

    print("=" * 65)
    print("       EDUCATIONAL DATASET BENCHMARK SUMMARY (ASSISTMENTS)")
    print("=" * 65)
    print(f"Total Interaction Records : {total_records:,}")
    print(f"Total Unique Learners     : {len(users):,}")
    print(f"Total Unique Questions    : {len(problems):,}")
    print(f"Total Knowledge Components: {len(skills):,}")
    print(f"Global Average Accuracy   : {accuracy:.2f}%")
    print("-" * 65)
    print("Sample Records (Chronological Sequence X_t):")
    print(f"{'Order':<7} | {'User ID':<8} | {'Skill Name':<25} | {'Correct'}")
    print("-" * 65)
    for r in sample_rows:
        print(f"{r['order_id']:<7} | {r['user_id']:<8} | {r['skill_name']:<25} | {r['correct']}")
    print("=" * 65)

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sample_csv = os.path.join(current_dir, "sample_assistments.csv")
    inspect_dataset(sample_csv)
