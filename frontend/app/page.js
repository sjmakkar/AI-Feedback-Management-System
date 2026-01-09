"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./styles.module.css";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

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

  const getRatingClass = (rating) => {
    if (rating >= 4) return styles.high;
    if (rating >= 3) return styles.medium;
    return styles.low;
  };

  return (
    <main className={styles.adminContainer}>
      <div style={{ marginBottom: "40px" }}>
        <h1 className={styles.heading}>Dashboard</h1>
        <p className={styles.subheading}>Review analytics & AI-powered insights</p>
      </div>

      {error && (
        <div className={styles.errorAlert} role="alert">
          <span className={styles.alertIcon}>⚠️</span>
          <div>
            <div className={styles.alertTitle}>Error Loading Reviews</div>
            <p>{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📭</div>
            <h2 style={{ fontSize: "1.5em", marginBottom: "8px" }}>No Reviews Yet</h2>
            <p>Start collecting feedback to see reviews here</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "30px", color: "#64748b" }}>
            <strong style={{ color: "#1e293b" }}>{reviews.length}</strong> reviews collected
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Rating</th>
                <th>User Review</th>
                <th>AI Summary</th>
                <th>Recommended Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className={`${styles.ratingBadge} ${getRatingClass(r.rating)}`}>
                      {r.rating}
                    </span>
                  </td>
                  <td>
                    <p style={{ maxHeight: "100px", overflow: "auto", fontSize: "0.95em" }}>
                      {r.review_text}
                    </p>
                  </td>
                  <td>
                    <p style={{ fontSize: "0.9em", color: "#475569" }}>
                      {expandedIds.has(r.id)
                        ? r.ai_summary
                        : r.ai_summary?.substring(0, 120)}
                      {r.ai_summary && r.ai_summary.length > 120 && (
                        <>
                          {expandedIds.has(r.id) ? (
                            <button
                              className={styles.readMoreLink}
                              onClick={() => toggleExpand(r.id)}
                            >
                              &nbsp;Show less
                            </button>
                          ) : (
                            <button
                              className={styles.readMoreLink}
                              onClick={() => toggleExpand(r.id)}
                            >
                              &nbsp;Read more
                            </button>
                          )}
                        </>
                      )}
                    </p>
                  </td>
                  <td>
                    <p style={{ fontSize: "0.9em", color: "#475569" }}>
                      {expandedIds.has(`a${r.id}`)
                        ? r.ai_recommended_actions
                        : r.ai_recommended_actions?.substring(0, 120)}
                      {r.ai_recommended_actions && r.ai_recommended_actions.length > 120 && (
                        <>
                          {expandedIds.has(`a${r.id}`) ? (
                            <button
                              className={styles.readMoreLink}
                              onClick={() => toggleExpand(`a${r.id}`)}
                            >
                              &nbsp;Show less
                            </button>
                          ) : (
                            <button
                              className={styles.readMoreLink}
                              onClick={() => toggleExpand(`a${r.id}`)}
                            >
                              &nbsp;Read more
                            </button>
                          )}
                        </>
                      )}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
