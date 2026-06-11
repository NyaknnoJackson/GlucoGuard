from sqlalchemy.orm import Session
from app.models.recommendation import Recommendation

RECOMMENDATIONS = {
    "High": {
        "diet": ("Reduce Sugar Intake Urgently", 
                 "Your glucose levels suggest high risk. Eliminate sugary drinks, white bread, and processed foods immediately. Focus on leafy greens, whole grains, and lean protein."),
        "exercise": ("Start Daily 30-Minute Walks",
                     "Regular aerobic exercise significantly reduces insulin resistance. Start with brisk 30-minute walks daily — no gym required."),
        "sleep": ("Prioritise 7–9 Hours of Sleep",
                  "Poor sleep raises cortisol and blood sugar. Set a consistent sleep schedule and avoid screens 1 hour before bed."),
        "alert": ("Consult a Doctor Soon",
                  "Your risk profile warrants a professional evaluation. Please schedule an HbA1c blood test with your physician.")
    },
    "Moderate": {
        "diet": ("Adopt a Low-Glycemic Diet",
                 "Replace high-GI foods with oats, legumes, sweet potatoes, and vegetables. Aim for meals that keep blood sugar stable."),
        "exercise": ("Exercise 150 Minutes Per Week",
                     "The WHO recommends 150 minutes of moderate exercise weekly. Split this into 5 x 30-minute sessions of cycling, swimming, or walking."),
        "hydration": ("Drink 2.5L of Water Daily",
                      "Proper hydration helps kidneys flush excess sugar. Track your intake and set hourly reminders.")
    },
    "Low": {
        "diet": ("Maintain a Balanced Diet",
                 "Keep up your healthy habits. Aim for a Mediterranean-style diet rich in vegetables, healthy fats, and lean proteins."),
        "exercise": ("Stay Active",
                     "Your risk is low — keep it that way. Maintain your current activity level and consider adding strength training twice a week."),
        "hydration": ("Stay Hydrated",
                      "Continue drinking 2L+ of water daily. Proper hydration supports metabolic health.")
    }
}

def generate_recommendations(db: Session, user_id: int, risk_result: dict, features: dict):
    label = risk_result["risk_label"]
    recs = RECOMMENDATIONS.get(label, RECOMMENDATIONS["Low"])

    # Delete previous recommendations before inserting fresh ones
    db.query(Recommendation).filter(Recommendation.user_id == user_id).delete()

    for category, (title, body) in recs.items():
        rec = Recommendation(
            user_id=user_id,
            category=category,
            title=title,
            body=body
        )
        db.add(rec)
    db.commit()