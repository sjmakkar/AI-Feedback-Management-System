"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "../styles.module.css";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function AdminDashboard() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [expandedIds, setExpandedIds] = useState(new Set());

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
      if (retryCount < 3 && errorMsg.includes("Failed to fetch")) {
        setTimeout(() => setRetryCount((c) => c + 1), 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchReviews();
    const interval = setInterval(fetchReviews, 10000);
    return () => clearInterval(interval);
  }, [fetchReviews]);

  const getRatingClass = (rating) => {
    if (rating >= 4) return styles.high;
    if (rating >= 3) return styles.medium;
    return styles.low;
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  return (
    <main className={styles.adminContainer}>
      <div style={{ marginBottom: "40px" }}>
        <h1 className={styles.heading}>Admin Dashboard</h1>
        <p className={styles.subheading}>Review analytics & AI-powered insights</p>
      </div>

      {error && (
        <div className={styles.errorAlert} role="alert">
          <span className={styles.alertIcon}>⚠️</span>
          <div>
            <div className={styles.alertTitle}>Error Loading Reviews</div>
            <p>{error}</p>
            {error.includes("Backend unavailable") && (
              <details style={{ marginTop: "12px", fontSize: "0.9em" }}>
                <summary style={{ cursor: "pointer", fontWeight: "600" }}>How to fix</summary>
                <p style={{ marginTop: "8px" }}>
                  Start the backend server in another terminal:
                  <code style={{ display: "block", marginTop: "8px", padding: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px" }}>
                    cd backend && python -m uvicorn app:app --reload
                  </code>
                </p>
              </details>
            )}
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
            <div className={styles.emptyStateIcon}>📊</div>
            <h2 style={{ fontSize: "1.5em", marginBottom: "8px" }}>No Reviews Yet</h2>
            <p>Reviews will appear here once users submit feedback</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "30px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div className={styles.card} style={{ flex: "1", minWidth: "150px" }}>
              <div style={{ fontSize: "2em", fontWeight: "700", color: "#2563eb" }}>
                {reviews.length}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.9em" }}>Total Reviews</div>
            </div>
            <div className={styles.card} style={{ flex: "1", minWidth: "150px" }}>
              <div style={{ fontSize: "2em", fontWeight: "700", color: "#10b981" }}>
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.9em" }}>Average Rating</div>
            </div>
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
                              aria-label="Show less summary"
                            >
                              &nbsp;Show less
                            </button>
                          ) : (
                            <button
                              className={styles.readMoreLink}
                              onClick={() => toggleExpand(r.id)}
                              aria-label="Read more summary"
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
                              aria-label="Show less actions"
                            >
                              &nbsp;Show less
                            </button>
                          ) : (
                            <button
                              className={styles.readMoreLink}
                              onClick={() => toggleExpand(`a${r.id}`)}
                              aria-label="Read more actions"
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
        </>      )}
    </main>
  );
}