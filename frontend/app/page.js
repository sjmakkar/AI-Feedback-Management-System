"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./styles.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function AdminDashboard() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/reviews`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReviews(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load reviews"
      );
    } finally {
      setLoading(false);
    }
  }, []);

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
