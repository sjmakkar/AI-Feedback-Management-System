"use client";

import { useState } from "react";
import styles from "../styles.module.css";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function UserFeedback() {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitReview = async () => {
    if (!review.trim()) {
      setError("Please enter a review");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");
    setSubmitted(false);

    try {
      const res = await fetch(`${API_URL}/submit-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: parseInt(rating, 10),
          review_text: review,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setResponse(data.ai_response);
      setReview("");
      setRating(5);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.mainContainer}>
      <h1 className={styles.heading}>Share Your Feedback</h1>
      <p className={styles.subheading}>Help us improve by sharing your experience</p>

      <div className={styles.card}>
        <div className={styles.ratingGroup}>
          <label className={styles.label}>How would you rate your experience?</label>
          <div className={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                className={`${styles.star} ${rating === r ? styles.active : ""}`}
                onClick={() => setRating(r)}
                disabled={loading}
                aria-label={`Rate ${r} stars`}
                aria-pressed={rating === r}
              >
                ★
              </button>
            ))}
          </div>
          <p style={{ marginTop: "8px", color: "#64748b", fontSize: "0.9em" }}>
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="review" className={styles.label}>
            Tell us more about your experience
          </label>
          <textarea
            id="review"
            className={styles.textarea}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share what went well or what we can improve..."
            aria-label="Review text area"
            disabled={loading}
          />
        </div>

        <button
          onClick={submitReview}
          disabled={loading || !review.trim()}
          className={styles.button}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner} style={{ width: "16px", height: "16px" }}></span>
              Submitting...
            </>
          ) : (
            "✓ Submit Feedback"
          )}
        </button>

        {error && (
          <div className={styles.errorAlert} role="alert">
            <span className={styles.alertIcon}>⚠️</span>
            <div>
              <div className={styles.alertTitle}>Error</div>
              <p>{error}</p>
            </div>
          </div>
        )}

        {submitted && response && (
          <div className={styles.successAlert} role="alert">
            <span className={styles.alertIcon}>✨</span>
            <div>
              <div className={styles.alertTitle}>AI Response</div>
              <p>{response}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
