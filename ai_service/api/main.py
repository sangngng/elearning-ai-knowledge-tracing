"""
FastAPI Microservice for Knowledge Tracing & Student Mastery Inference
Author: Nguyen Ngoc Sang (AI Lead)
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
import sys
import os

# Import local BKT baseline
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.bkt_baseline import BayesianKnowledgeTracing

app = FastAPI(
    title="E-Learning AI Knowledge Tracing Service",
    version="1.0.0",
    description="Microservice providing BKT and DKT inferences for student skill mastery"
)

bkt_engine = BayesianKnowledgeTracing(p_l0=0.2, p_t=0.15, p_g=0.25, p_s=0.1)

class InteractionItem(BaseModel):
    questionId: str
    skillId: str
    isCorrect: bool

class PredictRequest(BaseModel):
    userId: str
    interactions: List[InteractionItem]

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-knowledge-tracing", "version": "1.0.0"}

@app.post("/predict-mastery")
def predict_mastery(payload: PredictRequest):
    """
    Computes mastery levels for each skill given student interaction sequence.
    """
    # Group interactions by skillId
    skill_history: Dict[str, List[int]] = {}
    for item in payload.interactions:
        skill_history.setdefault(item.skillId, []).append(1 if item.isCorrect else 0)

    mastery_results = {}
    for skill_id, answers in skill_history.items():
        trajectory = bkt_engine.predict_sequence(answers)
        current_mastery = trajectory[-1]
        mastery_results[skill_id] = {
            "masteryScore": round(current_mastery, 4),
            "percentage": f"{current_mastery * 100:.1f}%",
            "status": "Mastered" if current_mastery >= 0.75 else ("Developing" if current_mastery >= 0.5 else "Needs Review")
        }

    return {
        "userId": payload.userId,
        "totalEvaluatedSkills": len(mastery_results),
        "skillMastery": mastery_results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
