"use client";

import { useMemo, useRef, useState } from "react";
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
    setEditing({ id: null, text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "", similar: [], imageUrl: null });
    setView("form");
  };

  const openEdit = (q) => {
    setEditing({ ...q, options: [...q.options], similar: (q.similar || []).map((s) => ({ ...s, options: [...s.options] })) });
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
          {q.imageUrl && (
            <img
              src={q.imageUrl}
              alt=""
              style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 12, marginBottom: 10 }}
            />
          )}
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

const MAX_SIMILAR = 3;

function QuestionForm({ initial, onCancel, onSave }) {
  const [q, setQ] = useState(initial);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingSimilar, setGeneratingSimilar] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const imageInputRef = useRef(null);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingImage(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "question-image");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در آپلود تصویر.");
      setQ((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      setError(err.message || "آپلود تصویر ممکن نشد.");
    }
    setUploadingImage(false);
  };

  const setOption = (i, val) => {
    const next = [...q.options];
    next[i] = val;
    setQ({ ...q, options: next });
  };

  const addEmptySimilar = () => {
    if (q.similar.length >= MAX_SIMILAR) return;
    setQ({ ...q, similar: [...q.similar, { text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" }] });
  };

  const removeSimilar = (idx) => {
    setQ({ ...q, similar: q.similar.filter((_, i) => i !== idx) });
  };

  const updateSimilar = (idx, patch) => {
    setQ({ ...q, similar: q.similar.map((s, i) => (i === idx ? { ...s, ...patch } : s)) });
  };

  const generateSimilarWithAI = async () => {
    if (!q.text.trim() || q.options.some((o) => !o.trim())) {
      setError("قبل از تولید سؤال مشابه، متن سؤال و هر چهار گزینه را کامل کنید.");
      return;
    }
    setGeneratingSimilar(true);
    setError("");
    try {
      const res = await fetch("/api/ai/similar-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: q.text, options: q.options, correctIndex: q.correctIndex }),
      });
      if (!res.ok) throw new Error();
      const items = await res.json();
      setQ({ ...q, similar: items.slice(0, MAX_SIMILAR) });
    } catch (e) {
      setError("تولید سؤال مشابه با هوش مصنوعی ممکن نشد — می‌توانید دستی اضافه کنید.");
    }
    setGeneratingSimilar(false);
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
    if (q.similar.some((s) => s.text.trim() && s.options.some((o) => !o.trim()))) {
      setError("برای هر سؤال مشابهی که متن دارد، هر چهار گزینه را هم کامل کنید.");
      return;
    }
    setError("");
    try {
      await onSave({ ...q, similar: q.similar.filter((s) => s.text.trim()) });
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
                background: q.correctIndex === i ? T.successSoft : T.surface,
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

      <SectionTitleInline>سؤال‌های مشابه</SectionTitleInline>
      <div style={{ fontSize: 11.5, color: T.textFaint, marginTop: 4, marginBottom: 10, wordBreak: "keep-all" }}>
        وقتی دانش‌آموز جواب اصلی را در تمرین اشتباه بزند، یکی از این‌ها به‌جای دوباره‌سؤال‌کردن نشان داده می‌شود (حداکثر {MAX_SIMILAR} عدد).
      </div>

      <button onClick={generateSimilarWithAI} disabled={generatingSimilar} style={{ ...aiButton, opacity: generatingSimilar ? 0.6 : 1 }}>
        <Wand2 size={14} /> {generatingSimilar ? `در حال تولید ${MAX_SIMILAR} سؤال...` : `تولید ${MAX_SIMILAR} سؤال مشابه با هوش مصنوعی`}
      </button>

      {q.similar.map((s, idx) => (
        <div key={idx} style={{ background: T.bg, borderRadius: 16, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <SectionTitleInline>سؤال مشابه {idx + 1}</SectionTitleInline>
            <button onClick={() => removeSimilar(idx)} style={iconBtn}>
              <X size={16} />
            </button>
          </div>
          <label style={fieldLabel}>متن سؤال مشابه</label>
          <textarea
            value={s.text}
            onChange={(e) => updateSimilar(idx, { text: e.target.value })}
            rows={2}
            style={{ ...fieldInput, resize: "vertical", marginBottom: 10 }}
          />
          {s.options.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <button
                onClick={() => updateSimilar(idx, { correctIndex: i })}
                style={{
                  width: 26,
                  height: 26,
                  minWidth: 26,
                  borderRadius: 8,
                  border: `1px solid ${s.correctIndex === i ? T.success : T.border}`,
                  background: s.correctIndex === i ? T.successSoft : T.surface,
                  color: T.success,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {s.correctIndex === i && <Check size={12} />}
              </button>
              <input
                value={opt}
                onChange={(e) => {
                  const next = [...s.options];
                  next[i] = e.target.value;
                  updateSimilar(idx, { options: next });
                }}
                style={{ ...fieldInput, flex: 1, padding: "9px 12px" }}
                placeholder={`گزینه ${["۱", "۲", "۳", "۴"][i]}`}
              />
            </div>
          ))}
        </div>
      ))}

      {q.similar.length < MAX_SIMILAR && (
        <button onClick={addEmptySimilar} style={{ ...ghostSmallBtn, marginTop: q.similar.length ? 0 : 12, marginBottom: 16 }}>
          <Plus size={13} /> افزودن دستی سؤال مشابه ({q.similar.length}/{MAX_SIMILAR})
        </button>
      )}

      {q.imageUrl && (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <img src={q.imageUrl} alt="" style={{ width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 14, border: `1px solid ${T.border}`, background: T.bg }} />
          <button
            onClick={() => setQ({ ...q, imageUrl: null })}
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              border: "none",
              borderRadius: 8,
              background: "rgba(0,0,0,0.55)",
              color: "#fff",
              padding: 5,
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
      <button onClick={() => imageInputRef.current?.click()} disabled={uploadingImage} style={{ ...ghostSmallBtn, marginBottom: 16, opacity: uploadingImage ? 0.6 : 1 }}>
        <ImagePlus size={14} /> {uploadingImage ? "در حال آپلود..." : q.imageUrl ? "تعویض تصویر" : "افزودن تصویر (اختیاری)"}
      </button>

      {error && <div style={{ color: T.danger, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

      <button onClick={submit} style={{ ...primarySmallBtn, width: "100%", padding: "13px 0" }}>
        ذخیره سؤال
      </button>
    </div>
  );
}
