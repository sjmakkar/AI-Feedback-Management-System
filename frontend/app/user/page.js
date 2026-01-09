"use client";

import { useState } from "react";
import styles from "../styles.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function UserFeedback() {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitReview = async () => {
    // Validation
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
      <h1 className={styles.heading}>User Feedback</h1>

      <div className={styles.formGroup}>
        <label htmlFor="rating" className={styles.label}>
          Rating:
        </label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className={styles.select}
          aria-label="Rating selection"
          disabled={loading}
        >
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>
              {r} Star{r !== 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="review" className={styles.label}>
          Review:
        </label>
        <textarea
          id="review"
          rows="5"
          className={styles.textarea}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your feedback..."
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
        {loading ? "Submitting..." : "Submit"}
      </button>

      {submitted && response && (
        <div className={styles.successAlert} role="alert">
          <div className={styles.alertTitle}>✓ AI Response:</div>
          <p>{response}</p>
        </div>
      )}

      {error && (
        <div className={styles.errorAlert} role="alert">
          <div className={styles.alertTitle}>⚠ Error:</div>
          <p>{error}</p>
        </div>
      )}
    </main>
  );
}
