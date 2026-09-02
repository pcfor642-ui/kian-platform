"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
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
        ? { id: null, title: "", duration: 20, questionIds: [], studentIds: [], status: "فعال" }
        : { id: null, title: "", description: "", questionIds: [], studentIds: [], status: "فعال" }
    );
    setView("form");
  };

  const openEdit = (it) => {
    setEditing({ ...it });
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

      {items.map((it) => (
        <div key={it.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, wordBreak: "keep-all" }}>{it.title || "بدون عنوان"}</div>
            <span style={{ fontSize: 11, color: T.success, background: T.successSoft, padding: "4px 10px", borderRadius: 999 }}>{it.status}</span>
          </div>
          <div style={{ fontSize: 12, color: T.textFaint, marginTop: 6 }}>
            {it.questionIds.length} سؤال · {it.studentIds.length} دانش‌آموز
            {isExam ? ` · ${it.duration} دقیقه` : ""}
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
      ))}
    </div>
  );
}

function AssignmentForm({ isExam, initial, questions, students, onCancel, onSave }) {
  const [it, setIt] = useState(initial);
  const [error, setError] = useState("");

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
      await onSave(it);
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

      <SectionTitleInline>انتخاب سؤال‌ها</SectionTitleInline>
      <div style={{ marginTop: 10, marginBottom: 16 }}>
        {questions.length === 0 && <EmptyNote text="ابتدا از بانک سؤال، سؤال بسازید." />}
        {questions.map((q) => (
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
