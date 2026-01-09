from google import genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create a client using the GEMINI_API_KEY environment variable (if set).
# The modern `google-genai` SDK exposes a `Client` with `models.generate_content`.
_api_key = os.getenv("GEMINI_API_KEY")

# Debug: print if key is found
if _api_key:
  print(f"✓ GEMINI_API_KEY found (length: {len(_api_key)})")
  try:
    client = genai.Client(api_key=_api_key)
    print("✓ Gemini client initialized successfully")
  except Exception as e:
    print(f"✗ Error initializing Gemini client: {e}")
    client = None
else:
  print("⚠ GEMINI_API_KEY not set. Using fallback responses.")
  print("  To enable real AI responses, set: $env:GEMINI_API_KEY='your-key'")
  client = None

MODEL_NAME = "gemini-2.5-flash"

PROMPT = """
You are an AI assistant for a company.

Given:
- User rating: {rating}
- User review: {review}

Tasks:
1. Write a polite response to the user
2. Summarize the issue in one sentence
3. Suggest recommended internal actions

Return STRICT JSON:
{{
  "user_reply": "...",
  "summary": "...",
  "recommended_actions": "..."
}}
"""

def generate_ai_outputs(rating, review):
  import json
  
  # If we have credentials, use the real Gemini API
  if client is not None:
    try:
      response = client.models.generate_content(
        model=MODEL_NAME,
        contents=PROMPT.format(rating=rating, review=review),
      )
      # Parse the response text to ensure it's valid JSON
      result_text = response.text
      # Extract JSON from response (in case there's extra text)
      if "```json" in result_text:
        result_text = result_text.split("```json")[1].split("```")[0].strip()
      elif "```" in result_text:
        result_text = result_text.split("```")[1].split("```")[0].strip()
      return result_text
    except Exception as e:
      print(f"Error calling Gemini API: {e}")
      # Fall back to deterministic response if API fails
  
  # Fallback response when no API key or API call fails
  # Make fallback smarter based on rating
  if rating >= 4:
    user_reply = f"Thank you for your {rating}-star review! We're glad you enjoyed your experience: {review[:150]}"
    recommended_actions = "Monitor satisfaction and continue delivering excellent service."
  elif rating == 3:
    user_reply = f"Thank you for your {rating}-star review. We appreciate your feedback: {review[:150]}"
    recommended_actions = "Identify areas for improvement and develop action plan."
  else:
    user_reply = f"We're sorry to hear about your {rating}-star experience. Your feedback is valuable: {review[:150]}"
    recommended_actions = "Urgent: Investigate issue, identify root cause, and contact customer to resolve."
  
  summary = review.strip()
  if len(summary) > 200:
    summary = summary[:200] + "..."
  
  return json.dumps({
    "user_reply": user_reply,
    "summary": summary,
    "recommended_actions": recommended_actions,
  })
