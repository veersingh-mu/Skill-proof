import type { TaskSubmission } from "./types";

export const TASK_SUBMISSIONS_STORAGE_KEY = "skillproof_task_submissions";

/**
 * Saves a completed task submission to browser localStorage.
 * Maintains chronological order and updates existing submissions by id.
 */
export function saveTaskSubmission(submission: TaskSubmission): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const existing = loadTaskSubmissions();
    const index = existing.findIndex((s) => s.id === submission.id || (s.taskId === submission.taskId && s.repositoryUrl === submission.repositoryUrl));
    if (index >= 0) {
      existing[index] = submission;
    } else {
      existing.unshift(submission);
    }
    window.localStorage.setItem(TASK_SUBMISSIONS_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn("Unable to persist task submission to localStorage:", err);
  }
}

/**
 * Loads all completed task submissions from browser localStorage.
 */
export function loadTaskSubmissions(): TaskSubmission[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(TASK_SUBMISSIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TaskSubmission[];
  } catch (err) {
    console.warn("Unable to parse task submissions from localStorage:", err);
    return [];
  }
}

/**
 * Clears all task submissions from browser localStorage.
 */
export function clearTaskSubmissions(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(TASK_SUBMISSIONS_STORAGE_KEY);
  } catch (err) {
    console.warn("Unable to clear task submissions from localStorage:", err);
  }
}
