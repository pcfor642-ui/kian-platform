"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, Wand2, ImagePlus, Check, X } from "lucide-react";
import { T, FONT } from "./theme";
import {
  fieldLabel,
  fieldInput,
  iconBtn,
  primaryIconBtn,
  ghostSmallBtn,
  primarySmallBtn,
  aiButton,
  SectionTitle,
  SectionTitleInline,
  EmptyNote,
} from "./ui";
import { useQuestions } from "./api-hooks";

function parseTextToQuestionLines(raw) {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let text = "";
  const options = [];
  let correctIndex = null;
  let explanation = "";

  const optionPattern = /^([۱۲۳۴1-4][-.)]|[الف|ب|ج|د][-.)])\s*(.*)/;

  lines.forEach((line) => {
    const optMatch = line.match(optionPattern);
    if (optMatch && options.length < 4) {
      let cleaned = optMatch[2].trim();
      const isCorrect = /\*|\(صحیح\)|✓/.test(cleaned);
      cleaned = cleaned.replace(/\*|\(صحیح\)|✓/g, "").trim();
      if (isCorrect) correctIndex = options.length;
      options.push(cleaned);
    } else if (/^(پاسخ|جواب)/.test(line)) {
      const m = line.match(/[۱۲۳۴1-4]/);
      if (m) {
        const map = { "۱": 0, "۲": 1, "۳": 2, "۴": 3, "1": 0, "2": 1, "3": 2, "4": 3 };
        correctIndex = map[m[0]] ?? correctIndex;
      }
    } else if (/^(توضیح)/.test(line)) {
      explanation = line.replace(/^(توضیح)[:：]?\s*/, "");
    } else if (!text) {
      text = line;
    }
  });

  return options.length >= 2
    ? {
        text,
        options: [0, 1, 2, 3].map((i) => options[i] || ""),
        correctIndex: correctIndex ?? 0,
        explanation,
      }
    : null;
}

function parseTextToQuestionInline(raw) {
  const numberMap = {
    "۱": 0, "1": 0, "یک": 0, "اول": 0,
    "۲": 1, "2": 1, "دو": 1, "دوم": 1,
    "۳": 2, "3": 2, "سه": 2, "سوم": 2,
    "۴": 3, "4": 3, "چهار": 3, "چهارم": 3,
  };
  const markerRe = /گزی.ه\s*(۱|۲|۳|۴|1|2|3|4|یک|دو|سه|چهار|اول|دوم|سوم|چهارم)/g;
  const matches = [...raw.matchAll(markerRe)];
  if (matches.length < 2) return null;

  const text = raw.slice(0, matches[0].index).trim();
  const options = ["", "", "", ""];
  matches.forEach((m, i) => {
    const idx = numberMap[m[1]];
    if (idx === undefined) return;
    const start = m.index + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : raw.length;
    options[idx] = raw.slice(start, end).trim();
  });

  return { text, options, correctIndex: 0, explanation: "" };
}

function parseTextToQuestion(raw) {
  return parseTextToQuestionLines(raw) || parseTextToQuestionInline(raw) || { text: raw.trim(), options: ["", "", "", ""], correctIndex: 0, explanation: "" };
}

async function aiParseQuestion(raw) {
  const res = await fetch("/api/ai/parse-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) throw new Error("ai_unavailable");
  return res.json();
}

export function QuestionBank({ roleLabel }) {
  const { ready, questions, create, update, remove } = useQuestions();
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(
    () => questions.filter((q) => q.text.includes(search.trim())),
    [questions, search]
  );

  const openNew = () => {
    setEditing({ id: null, text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "", similar: null });
    setView("form");
  };

  const openEdit = (q) => {
    setEditing({ ...q, options: [...q.options] });
    setView("form");
  };

  const submit = async (q) => {
    if (q.id) {
      await update(q.id, q);
    } else {
      await create(q);
    }
    setView("list");
  };

  if (!ready) return <EmptyNote text="در حال بارگذاری بانک سؤال..." />;

  if (view === "form") {
    return <QuestionForm initial={editing} onCancel={() => setView("list")} onSave={submit} />;
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <SectionTitle>بانک سؤال</SectionTitle>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} color={T.textFaint} style={{ position: "absolute", top: 11, right: 12 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جست‌وجوی سؤال..."
            style={{ ...fieldInput, paddingRight: 34 }}
          />
        </div>
        <button onClick={openNew} style={primaryIconBtn}>
          <Plus size={18} />
        </button>
      </div>

      {filtered.length === 0 && <EmptyNote text="سؤالی یافت نشد." />}

      {filtered.map((q) => (
        <div key={q.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ fontSize: 13.5, color: T.text, wordBreak: "keep-all", overflowWrap: "break-word", marginBottom: 8 }}>
            {q.text}
          </div>
          <div style={{ fontSize: 11.5, color: T.textFaint, marginBottom: 10 }}>
            {q.options.filter(Boolean).length} گزینه · پاسخ صحیح: {q.options[q.correctIndex]}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openEdit(q)} style={ghostSmallBtn}>
              <Pencil size={13} /> ویرایش
            </button>
            <button onClick={() => remove(q.id)} style={{ ...ghostSmallBtn, color: T.danger }}>
              <Trash2 size={13} /> حذف
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionForm({ initial, onCancel, onSave }) {
  const [q, setQ] = useState(initial);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const setOption = (i, val) => {
    const next = [...q.options];
    next[i] = val;
    setQ({ ...q, options: next });
  };

  const applyPaste = async () => {
    if (!pasteText.trim()) {
      setError("ابتدا متن سؤال را وارد کنید.");
      return;
    }
    setAnalyzing(true);
    setError("");
    let parsed;
    try {
      parsed = await aiParseQuestion(pasteText);
      if (!parsed.text || parsed.options.filter(Boolean).length < 2) {
        parsed = parseTextToQuestion(pasteText);
      }
    } catch (e) {
      parsed = parseTextToQuestion(pasteText);
    }
    setQ({ ...q, ...parsed });
    setAnalyzing(false);
    setPasteOpen(false);
    setPasteText("");
    setError("");
  };

  const submit = async () => {
    if (!q.text.trim() || q.options.some((o) => !o.trim())) {
      setError("متن سؤال و هر چهار گزینه را کامل کنید.");
      return;
    }
    setError("");
    try {
      await onSave(q);
    } catch (e) {
      setError(e.message || "خطایی رخ داد.");
    }
  };

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SectionTitleInline>{q.id ? "ویرایش سؤال" : "ساخت سؤال جدید"}</SectionTitleInline>
        <button onClick={onCancel} style={iconBtn}>
          <X size={18} />
        </button>
      </div>

      {!pasteOpen && (
        <button onClick={() => setPasteOpen(true)} style={aiButton}>
          <Wand2 size={15} /> تبدیل متن به سؤال
        </button>
      )}

      {pasteOpen && (
        <div style={{ background: T.purpleSoft, borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 12.5, color: T.textSoft, marginBottom: 8, wordBreak: "keep-all" }}>
            متن کپی‌شده را وارد کن، حتی اگر غلط املایی داشته باشد یا همه پشت‌سرهم نوشته شده باشد — هوش مصنوعی فرم را پر می‌کند و قبل از ذخیره می‌تونی ویرایشش کنی.
          </div>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={5}
            disabled={analyzing}
            placeholder={"مثال:\nپایتخت ایران کدام شهر است؟\n۱) اصفهان\n۲) تهران*\n۳) شیراز\n۴) تبریز"}
            style={{ ...fieldInput, resize: "vertical", opacity: analyzing ? 0.6 : 1 }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={applyPaste} disabled={analyzing} style={{ ...primarySmallBtn, opacity: analyzing ? 0.6 : 1 }}>
              {analyzing ? "در حال تحلیل..." : "تحلیل و پر کردن فرم"}
            </button>
            <button onClick={() => setPasteOpen(false)} disabled={analyzing} style={ghostSmallBtn}>انصراف</button>
          </div>
        </div>
      )}

      <label style={fieldLabel}>متن سؤال</label>
      <textarea
        value={q.text}
        onChange={(e) => setQ({ ...q, text: e.target.value })}
        rows={2}
        style={{ ...fieldInput, resize: "vertical", marginBottom: 14 }}
      />

      {q.options.map((opt, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <label style={fieldLabel}>گزینه {["۱", "۲", "۳", "۴"][i]}</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setQ({ ...q, correctIndex: i })}
              style={{
                width: 30,
                height: 30,
                minWidth: 30,
                borderRadius: 9,
                border: `1px solid ${q.correctIndex === i ? T.success : T.border}`,
                background: q.correctIndex === i ? T.successSoft : "#fff",
                color: T.success,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              title="پاسخ صحیح"
            >
              {q.correctIndex === i && <Check size={15} />}
            </button>
            <input
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              style={{ ...fieldInput, flex: 1 }}
              placeholder={`متن گزینه ${["۱", "۲", "۳", "۴"][i]}`}
            />
          </div>
        </div>
      ))}

      <label style={{ ...fieldLabel, marginTop: 4 }}>توضیح پاسخ (اختیاری)</label>
      <textarea
        value={q.explanation}
        onChange={(e) => setQ({ ...q, explanation: e.target.value })}
        rows={2}
        style={{ ...fieldInput, resize: "vertical", marginBottom: 14 }}
      />

      {!q.similar && (
        <button
          onClick={() =>
            setQ({ ...q, similar: { text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" } })
          }
          style={{ ...ghostSmallBtn, marginBottom: 16 }}
        >
          <Plus size={13} /> افزودن سؤال مشابه
        </button>
      )}

      {q.similar && (
        <div style={{ background: T.bg, borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <SectionTitleInline>سؤال مشابه</SectionTitleInline>
            <button onClick={() => setQ({ ...q, similar: null })} style={iconBtn}>
              <X size={16} />
            </button>
          </div>
          <label style={fieldLabel}>متن سؤال مشابه</label>
          <textarea
            value={q.similar.text}
            onChange={(e) => setQ({ ...q, similar: { ...q.similar, text: e.target.value } })}
            rows={2}
            style={{ ...fieldInput, resize: "vertical", marginBottom: 10 }}
          />
          {q.similar.options.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <button
                onClick={() => setQ({ ...q, similar: { ...q.similar, correctIndex: i } })}
                style={{
                  width: 26,
                  height: 26,
                  minWidth: 26,
                  borderRadius: 8,
                  border: `1px solid ${q.similar.correctIndex === i ? T.success : T.border}`,
                  background: q.similar.correctIndex === i ? T.successSoft : "#fff",
                  color: T.success,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {q.similar.correctIndex === i && <Check size={12} />}
              </button>
              <input
                value={opt}
                onChange={(e) => {
                  const next = [...q.similar.options];
                  next[i] = e.target.value;
                  setQ({ ...q, similar: { ...q.similar, options: next } });
                }}
                style={{ ...fieldInput, flex: 1, padding: "9px 12px" }}
                placeholder={`گزینه ${["۱", "۲", "۳", "۴"][i]}`}
              />
            </div>
          ))}
        </div>
      )}

      <button style={{ ...ghostSmallBtn, marginBottom: 16 }}>
        <ImagePlus size={14} /> افزودن تصویر (اختیاری)
      </button>

      {error && <div style={{ color: T.danger, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

      <button onClick={submit} style={{ ...primarySmallBtn, width: "100%", padding: "13px 0" }}>
        ذخیره سؤال
      </button>
    </div>
  );
}
