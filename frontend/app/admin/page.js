"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "../styles.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function AdminDashboard() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/reviews`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReviews(data);
      setError("");
      setRetryCount(0);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load reviews";
      setError(
        errorMsg.includes("Failed to fetch") || errorMsg.includes("HTTP")
          ? `Backend unavailable. Make sure the server is running at ${API_URL}`
          : errorMsg
      );
      // Auto-retry on network errors
      if (retryCount < 3 && errorMsg.includes("Failed to fetch")) {
        setTimeout(() => setRetryCount((c) => c + 1), 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchReviews();
    const interval = setInterval(fetchReviews, 10000); // auto-refresh
    return () => clearInterval(interval);
  }, [fetchReviews]);

  return (
    <main className={styles.adminContainer}>
      <h1 className={styles.heading}>Admin Dashboard</h1>

      {error && (
        <div className={styles.errorAlert} role="alert">
          <div className={styles.alertTitle}>⚠ Error:</div>
          <p>{error}</p>
          {error.includes("Backend unavailable") && (
            <details style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
              <summary>How to fix</summary>
              <p>
                Start the backend server in another terminal:
                <code style={{ display: "block", marginTop: "0.5rem" }}>
                  cd backend && python -m uvicorn app:app --reload
                </code>
              </p>
            </details>
          )}
        </div>
      )}

      {loading && <p className={styles.loadingText}>Loading reviews...</p>}

      {!loading && reviews.length === 0 && (
        <p className={styles.loadingText}>No reviews yet</p>
      )}

      {reviews.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rating</th>
              <th>User Review</th>
              <th>AI Summary</th>
              <th>Recommended Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.rating} ⭐</td>
                <td>{r.review_text}</td>
                <td>{r.ai_summary}</td>
                <td>{r.ai_recommended_actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
