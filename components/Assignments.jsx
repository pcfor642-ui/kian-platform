"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Search, CalendarClock } from "lucide-react";
import { T, FONT } from "./theme";
import {
  fieldLabel,
  fieldInput,
  iconBtn,
  ghostSmallBtn,
  primarySmallBtn,
  aiButton,
  SectionTitle,
  SectionTitleInline,
  EmptyNote,
  CheckRow,
} from "./ui";
import { useAssignments, useQuestions } from "./api-hooks";

export function AssignmentBank({ type, students }) {
  const isExam = type === "exam";
  const { ready, items, create, update, remove } = useAssignments(type);
  const { questions } = useQuestions();
  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(null);

  const openNew = () => {
    setEditing(
      isExam
        ? { id: null, title: "", duration: 20, expiresAt: "", questionIds: [], studentIds: [], status: "فعال" }
        : { id: null, title: "", description: "", expiresAt: "", questionIds: [], studentIds: [], status: "فعال" }
    );
    setView("form");
  };

  const openEdit = (it) => {
    setEditing({ ...it, expiresAt: it.expiresAt ? it.expiresAt.slice(0, 10) : "" });
    setView("form");
  };

  const submit = async (it) => {
    if (it.id) {
      await update(it.id, it);
    } else {
      await create(it);
    }
    setView("list");
  };

  if (!ready) return <EmptyNote text="در حال بارگذاری..." />;

  if (view === "form") {
    return (
      <AssignmentForm
        isExam={isExam}
        initial={editing}
        questions={questions}
        students={students}
        onCancel={() => setView("list")}
        onSave={submit}
      />
    );
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <SectionTitle>{isExam ? "آزمون‌ها" : "تمرین‌ها"}</SectionTitle>

      <button onClick={openNew} style={aiButton}>
        <Plus size={15} /> {isExam ? "آزمون جدید" : "تمرین جدید"}
      </button>

      {items.length === 0 && <EmptyNote text={isExam ? "هنوز آزمونی ساخته نشده است." : "هنوز تمرینی ساخته نشده است."} />}

      {items.map((it) => {
        const expired = it.expiresAt && new Date(it.expiresAt) < new Date();
        return (
          <div key={it.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, wordBreak: "keep-all" }}>{it.title || "بدون عنوان"}</div>
              <span
                style={{
                  fontSize: 11,
                  color: expired ? T.danger : T.success,
                  background: expired ? T.dangerSoft : T.successSoft,
                  padding: "4px 10px",
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                }}
              >
                {expired ? "منقضی‌شده" : it.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: T.textFaint, marginTop: 6 }}>
              {it.questionIds.length} سؤال · {it.studentIds.length} دانش‌آموز
              {isExam ? ` · ${it.duration} دقیقه` : ""}
              {it.expiresAt ? ` · تا ${new Date(it.expiresAt).toLocaleDateString("fa-IR")}` : ""}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={() => openEdit(it)} style={ghostSmallBtn}>
                <Pencil size={13} /> ویرایش
              </button>
              <button onClick={() => remove(it.id)} style={{ ...ghostSmallBtn, color: T.danger }}>
                <Trash2 size={13} /> حذف
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AssignmentForm({ isExam, initial, questions, students, onCancel, onSave }) {
  const [it, setIt] = useState(initial);
  const [error, setError] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");

  const filteredQuestions = useMemo(
    () => questions.filter((q) => q.text.includes(questionSearch.trim())),
    [questions, questionSearch]
  );

  const toggleQuestion = (id) => {
    const has = it.questionIds.includes(id);
    setIt({ ...it, questionIds: has ? it.questionIds.filter((x) => x !== id) : [...it.questionIds, id] });
  };

  const toggleStudent = (id) => {
    const has = it.studentIds.includes(id);
    setIt({ ...it, studentIds: has ? it.studentIds.filter((x) => x !== id) : [...it.studentIds, id] });
  };

  const allStudentsSelected = students.length > 0 && it.studentIds.length === students.length;

  const submit = async () => {
    if (!it.title.trim()) {
      setError("عنوان را وارد کنید.");
      return;
    }
    if (it.questionIds.length === 0) {
      setError("حداقل یک سؤال انتخاب کنید.");
      return;
    }
    if (it.studentIds.length === 0) {
      setError("حداقل یک دانش‌آموز را انتخاب کنید.");
      return;
    }
    setError("");
    try {
      await onSave({ ...it, expiresAt: it.expiresAt ? it.expiresAt : null });
    } catch (e) {
      setError(e.message || "خطایی رخ داد.");
    }
  };

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SectionTitleInline>{it.id ? "ویرایش" : isExam ? "آزمون جدید" : "تمرین جدید"}</SectionTitleInline>
        <button onClick={onCancel} style={iconBtn}>
          <X size={18} />
        </button>
      </div>

      <label style={fieldLabel}>عنوان</label>
      <input value={it.title} onChange={(e) => setIt({ ...it, title: e.target.value })} style={{ ...fieldInput, marginBottom: 14 }} />

      {!isExam && (
        <>
          <label style={fieldLabel}>توضیحات</label>
          <textarea
            value={it.description}
            onChange={(e) => setIt({ ...it, description: e.target.value })}
            rows={2}
            style={{ ...fieldInput, resize: "vertical", marginBottom: 14 }}
          />
        </>
      )}

      {isExam && (
        <>
          <label style={fieldLabel}>مدت زمان (دقیقه)</label>
          <input
            type="number"
            value={it.duration}
            onChange={(e) => setIt({ ...it, duration: Number(e.target.value) })}
            style={{ ...fieldInput, marginBottom: 14 }}
          />
        </>
      )}

      <label style={fieldLabel}>
        <CalendarClock size={13} style={{ verticalAlign: "-2px", marginLeft: 4 }} />
        تاریخ انقضا (اختیاری — بعد از این تاریخ برای دانش‌آموز نمایش داده نمی‌شود)
      </label>
      <input
        type="date"
        value={it.expiresAt || ""}
        onChange={(e) => setIt({ ...it, expiresAt: e.target.value })}
        style={{ ...fieldInput, marginBottom: 14 }}
      />

      <SectionTitleInline>انتخاب سؤال‌ها</SectionTitleInline>
      <div style={{ position: "relative", marginTop: 10, marginBottom: 10 }}>
        <Search size={15} color={T.textFaint} style={{ position: "absolute", top: 11, right: 12 }} />
        <input
          value={questionSearch}
          onChange={(e) => setQuestionSearch(e.target.value)}
          placeholder="جست‌وجو در بانک سؤال بر اساس متن..."
          style={{ ...fieldInput, paddingRight: 34 }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        {questions.length === 0 && <EmptyNote text="ابتدا از بانک سؤال، سؤال بسازید." />}
        {questions.length > 0 && filteredQuestions.length === 0 && <EmptyNote text="سؤالی با این عبارت یافت نشد." />}
        {filteredQuestions.map((q) => (
          <CheckRow key={q.id} label={q.text} checked={it.questionIds.includes(q.id)} onToggle={() => toggleQuestion(q.id)} />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <SectionTitleInline>تخصیص به دانش‌آموزان</SectionTitleInline>
        <button
          onClick={() => setIt({ ...it, studentIds: allStudentsSelected ? [] : students.map((s) => s.id) })}
          style={{ ...ghostSmallBtn, fontSize: 11.5 }}
        >
          {allStudentsSelected ? "لغو انتخاب همه" : "انتخاب همه"}
        </button>
      </div>
      <div style={{ marginTop: 10, marginBottom: 16 }}>
        {students.map((s) => (
          <CheckRow key={s.id} label={s.name} sub={s.username} checked={it.studentIds.includes(s.id)} onToggle={() => toggleStudent(s.id)} />
        ))}
      </div>

      {error && <div style={{ color: T.danger, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

      <button onClick={submit} style={{ ...primarySmallBtn, width: "100%", padding: "13px 0" }}>
        {isExam ? "ذخیره آزمون" : "ذخیره تمرین"}
      </button>
    </div>
  );
}
