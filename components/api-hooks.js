"use client";

import { useCallback, useEffect, useState } from "react";

async function jsonFetch(url, options) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "خطایی رخ داد.");
  return data;
}

function useApiList(url) {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState([]);

  const reload = useCallback(async () => {
    try {
      const res = await fetch(url);
      if (res.ok) setItems(await res.json());
    } catch (e) {
      /* offline */
    }
    setReady(true);
  }, [url]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ready, items, setItems, reload };
}

/* ---------------- Users ---------------- */

export function useUsers(role) {
  const { ready, items, setItems, reload } = useApiList(`/api/users?role=${role}`);

  const create = async (form) => {
    const user = await jsonFetch("/api/users", { method: "POST", body: JSON.stringify({ ...form, role }) });
    await reload();
    return user;
  };

  const update = async (id, form) => {
    const user = await jsonFetch(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(form) });
    await reload();
    return user;
  };

  const remove = async (id) => {
    await jsonFetch(`/api/users/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((u) => u.id !== id));
  };

  return { ready, users: items, create, update, remove, reload };
}

/* ---------------- Questions ---------------- */

export function useQuestions() {
  const { ready, items, reload } = useApiList("/api/questions");

  const create = async (q) => {
    await jsonFetch("/api/questions", { method: "POST", body: JSON.stringify(q) });
    await reload();
  };

  const update = async (id, q) => {
    await jsonFetch(`/api/questions/${id}`, { method: "PATCH", body: JSON.stringify(q) });
    await reload();
  };

  const remove = async (id) => {
    await jsonFetch(`/api/questions/${id}`, { method: "DELETE" });
    await reload();
  };

  return { ready, questions: items, create, update, remove };
}

/* ---------------- Assignments (exercises / exams) ---------------- */

export function useAssignments(type) {
  const { ready, items, reload } = useApiList(`/api/assignments?type=${type}`);

  const create = async (it) => {
    await jsonFetch("/api/assignments", { method: "POST", body: JSON.stringify({ ...it, type }) });
    await reload();
  };

  const update = async (id, it) => {
    await jsonFetch(`/api/assignments/${id}`, { method: "PATCH", body: JSON.stringify(it) });
    await reload();
  };

  const remove = async (id) => {
    await jsonFetch(`/api/assignments/${id}`, { method: "DELETE" });
    await reload();
  };

  return { ready, items, create, update, remove };
}

/* ---------------- Results ---------------- */

export function useResults() {
  const { ready, items, reload } = useApiList("/api/results");

  const add = async (result) => {
    const created = await jsonFetch("/api/results", { method: "POST", body: JSON.stringify(result) });
    await reload();
    return created;
  };

  return { ready, results: items, add };
}

/* ---------------- Exit / anti-cheating events ---------------- */

export function useExitEvents(enabled = true) {
  const { ready, items, reload } = useApiList(enabled ? "/api/exit-events" : "/api/exit-events?disabled=1");

  const add = async (event) => {
    try {
      await jsonFetch("/api/exit-events", { method: "POST", body: JSON.stringify(event) });
    } catch (e) {
      /* best-effort */
    }
  };

  return { ready, events: enabled ? items : [], add };
}

/* ---------------- Messages ---------------- */

export function useMessages() {
  const { ready, items, reload } = useApiList("/api/messages");

  const send = async (receiverId, text, attachment) => {
    await jsonFetch("/api/messages", {
      method: "POST",
      body: JSON.stringify({
        receiverId,
        text,
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
      }),
    });
    await reload();
  };

  const markRead = async (otherId) => {
    await jsonFetch("/api/messages/read", { method: "POST", body: JSON.stringify({ otherId }) });
    await reload();
  };

  return { ready, messages: items, send, markRead };
}

/* ---------------- School settings ---------------- */

export function useSchoolSettings() {
  const { ready, items, setItems, reload } = useApiList("/api/settings");
  const settings = Array.isArray(items) ? null : items;

  const save = async (next) => {
    const updated = await jsonFetch("/api/settings", { method: "PUT", body: JSON.stringify(next) });
    setItems(updated);
    return updated;
  };

  return { ready, settings, save };
}
