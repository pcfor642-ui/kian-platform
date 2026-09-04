"use client";

import { useMemo, useState } from "react";
import { TrendingUp, CheckCircle2, Clock, ChevronLeft, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { T, FONT } from "./theme";
import { SectionTitle, StatRow, EmptyNote, FollowUpRow, ghostSmallBtn } from "./ui";

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

function AvgRing({ percentage }) {
  return (
    <div
      style={{
        width: 92,
        height: 92,
        borderRadius: "50%",
        background: `conic-gradient(${T.blue} ${percentage}%, ${T.border} 0)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: T.surface,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 19, fontWeight: 800, color: T.text }}>{percentage}٪</div>
        <div style={{ fontSize: 9.5, color: T.textFaint }}>میانگین</div>
      </div>
    </div>
  );
}

function StudentRow({ student, avgPct, doneCount, totalCount, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "12px 14px",
        marginBottom: 8,
        cursor: "pointer",
        textAlign: "right",
        fontFamily: FONT,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13.5, color: T.text, fontWeight: 700, wordBreak: "keep-all" }}>{student.name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: T.textFaint }}>{doneCount}/{totalCount}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: avgPct >= 60 ? T.success : T.danger }}>{avgPct}٪</span>
          <ChevronLeft size={15} color={T.textFaint} />
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: T.border, overflow: "hidden" }}>
        <div style={{ width: `${avgPct}%`, height: "100%", background: avgPct >= 60 ? T.success : T.warning, borderRadius: 999 }} />
      </div>
    </button>
  );
}

function WrongAnswersReview({ result, questions }) {
  const [open, setOpen] = useState(false);
  const wrong = (result.answerDetail || []).filter((a) => !a.isCorrect);
  if (result.type !== "exam" || wrong.length === 0) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ ...ghostSmallBtn, fontSize: 11.5 }}
      >
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {open ? "بستن سؤال‌های اشتباه" : `مشاهده ${wrong.length} سؤال اشتباه`}
      </button>
      {open && (
        <div style={{ marginTop: 8 }}>
          {wrong.map((a, i) => {
            const q = questions.find((qq) => qq.id === a.questionId);
            if (!q) return null;
            return (
              <div key={i} style={{ background: T.dangerSoft, borderRadius: 12, padding: "10px 12px", marginBottom: 6 }}>
                <div style={{ fontSize: 12.5, color: T.text, wordBreak: "keep-all", overflowWrap: "break-word", marginBottom: 6 }}>{q.text}</div>
                <div style={{ fontSize: 11.5, color: T.danger, wordBreak: "keep-all" }}>
                  پاسخ دانش‌آموز: {a.selectedIndex === null ? "بدون پاسخ" : q.options[a.selectedIndex]}
                </div>
                <div style={{ fontSize: 11.5, color: T.success, wordBreak: "keep-all" }}>پاسخ صحیح: {q.options[a.correctIndex]}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentDrillDown({ student, results, allAssignments, questions, onBack }) {
  const myResults = results
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const myAssignments = allAssignments.filter((a) => a.studentIds.includes(student.id));
  const avgPct = myResults.length ? Math.round(myResults.reduce((s, r) => s + r.percentage, 0) / myResults.length) : 0;
  const progressPct = myAssignments.length ? Math.round((myResults.length / myAssignments.length) * 100) : 0;

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={onBack} style={{ border: "none", background: "transparent", color: T.textSoft, cursor: "pointer", display: "flex" }}>
          <ArrowRight size={19} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: T.text, wordBreak: "keep-all" }}>{student.name}</span>
      </div>

      <StatRow
        items={[
          { icon: <CheckCircle2 size={18} />, value: myResults.length, label: "کار انجام‌شده", color: T.success },
          { icon: <TrendingUp size={18} />, value: `${avgPct}٪`, label: "میانگین موفقیت" },
          { icon: <Clock size={18} />, value: `${progressPct}٪`, label: "درصد پیشرفت", color: T.purple },
        ]}
      />

      <SectionTitle>تاریخچه‌ی کامل</SectionTitle>
      {myResults.length === 0 && <EmptyNote text="هنوز نتیجه‌ای ثبت نشده است." />}
      {myResults.map((r) => (
        <div key={r.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12.5, color: T.text, wordBreak: "keep-all" }}>
              {r.type === "exam" ? "آزمون" : "تمرین"} — {r.title}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: r.percentage >= 60 ? T.success : T.danger }}>{r.percentage}٪</div>
              <div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 2 }}>{new Date(r.createdAt).toLocaleDateString("fa-IR")}</div>
            </div>
          </div>
          {questions && <WrongAnswersReview result={r} questions={questions} />}
        </div>
      ))}
    </div>
  );
}

export function ResultsPage({ students, exercises, exams, results, exitEvents, questions }) {
  const [drillDownId, setDrillDownId] = useState(null);

  const allAssignments = useMemo(
    () => [...exercises.map((e) => ({ ...e, type: "exercise" })), ...exams.map((e) => ({ ...e, type: "exam" }))],
    [exercises, exams]
  );

  const studentIds = students.map((s) => s.id);
  const rows = results.filter((r) => studentIds.includes(r.studentId));

  const pending = [];
  allAssignments.forEach((a) => {
    a.studentIds.forEach((sid) => {
      if (!studentIds.includes(sid)) return;
      const done = results.some((r) => r.assignmentId === a.id && r.studentId === sid);
      if (!done) {
        const student = students.find((s) => s.id === sid);
        if (student) pending.push({ student, assignment: a });
      }
    });
  });

  const avgPct = rows.length ? Math.round(rows.reduce((s, r) => s + r.percentage, 0) / rows.length) : 0;

  if (drillDownId) {
    const student = students.find((s) => s.id === drillDownId);
    if (student) {
      return (
        <StudentDrillDown
          student={student}
          results={results}
          allAssignments={allAssignments}
          questions={questions}
          onBack={() => setDrillDownId(null)}
        />
      );
    }
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <SectionTitle>نتایج</SectionTitle>

      <AvgRing percentage={avgPct} />

      <div style={{ marginTop: 16 }}>
        <StatRow
          items={[
            { icon: <CheckCircle2 size={18} />, value: rows.length, label: "پاسخ ثبت‌شده", color: T.success },
            { icon: <Clock size={18} />, value: pending.length, label: "در انتظار تکمیل", color: T.warning },
          ]}
        />
      </div>

      <SectionTitle>دانش‌آموزان</SectionTitle>
      {students.length === 0 && <EmptyNote text="دانش‌آموزی وجود ندارد." />}
      {students.map((s) => {
        const myRows = rows.filter((r) => r.studentId === s.id);
        const myAvg = myRows.length ? Math.round(myRows.reduce((sum, r) => sum + r.percentage, 0) / myRows.length) : 0;
        const totalCount = allAssignments.filter((a) => a.studentIds.includes(s.id)).length;
        return (
          <StudentRow
            key={s.id}
            student={s}
            avgPct={myAvg}
            doneCount={myRows.length}
            totalCount={totalCount}
            onClick={() => setDrillDownId(s.id)}
          />
        );
      })}

      <SectionTitle>در انتظار تکمیل</SectionTitle>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: pending.length ? "6px 4px" : 0 }}>
        {pending.length === 0 && <EmptyNote text="کسی در انتظار تکمیل نیست." />}
        {pending.map((p, i) => (
          <FollowUpRow
            key={i}
            name={p.student.name}
            item={`${p.assignment.type === "exam" ? "آزمون" : "تمرین"} — ${p.assignment.title}`}
            status="ناتمام"
            statusColor={T.warning}
            date=""
          />
        ))}
      </div>

      {exitEvents && (
        <>
          <SectionTitle>فعالیت مشکوک در آزمون‌ها</SectionTitle>
          {exitEvents.filter((e) => studentIds.includes(e.studentId)).length === 0 && (
            <EmptyNote text="موردی ثبت نشده است." />
          )}
          {exitEvents
            .filter((e) => studentIds.includes(e.studentId))
            .slice(0, 8)
            .map((e) => (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: T.dangerSoft,
                  borderRadius: 14,
                  padding: "11px 14px",
                  marginBottom: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: T.text, wordBreak: "keep-all" }}>{e.studentName}</div>
                  <div style={{ fontSize: 11.5, color: T.textFaint, marginTop: 2, wordBreak: "keep-all" }}>
                    خروج از آزمون «{e.assignmentTitle}»
                  </div>
                </div>
                <div style={{ fontSize: 11, color: T.danger }}>{formatTime(e.createdAt)}</div>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
