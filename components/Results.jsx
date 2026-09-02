"use client";

import { useMemo } from "react";
import { TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { T, FONT } from "./theme";
import { SectionTitle, StatRow, EmptyNote, FollowUpRow } from "./ui";

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

export function ResultsPage({ students, exercises, exams, results, exitEvents }) {
  const allAssignments = useMemo(
    () => [...exercises.map((e) => ({ ...e, type: "exercise" })), ...exams.map((e) => ({ ...e, type: "exam" }))],
    [exercises, exams]
  );

  const studentIds = students.map((s) => s.id);
  const rows = results
    .filter((r) => studentIds.includes(r.studentId))
    .map((r) => {
      const student = students.find((s) => s.id === r.studentId);
      const assignment = allAssignments.find((a) => a.id === r.assignmentId);
      return { ...r, studentName: student?.name || "—", title: assignment?.title || "—" };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

  return (
    <div style={{ paddingTop: 8 }}>
      <SectionTitle>نتایج</SectionTitle>
      <StatRow
        items={[
          { icon: <TrendingUp size={18} />, value: `${avgPct}٪`, label: "میانگین موفقیت" },
          { icon: <CheckCircle2 size={18} />, value: rows.length, label: "پاسخ ثبت‌شده", color: T.success },
          { icon: <Clock size={18} />, value: pending.length, label: "در انتظار تکمیل", color: T.warning },
        ]}
      />

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

      <SectionTitle>نتایج ثبت‌شده</SectionTitle>
      {rows.length === 0 && <EmptyNote text="هنوز نتیجه‌ای ثبت نشده است." />}
      {rows.map((r) => (
        <div
          key={r.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "12px 14px",
            marginBottom: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 13.5, color: T.text, wordBreak: "keep-all" }}>{r.studentName}</div>
            <div style={{ fontSize: 11.5, color: T.textFaint, marginTop: 2, wordBreak: "keep-all" }}>
              {r.type === "exam" ? "آزمون" : "تمرین"} — {r.title}
            </div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: r.percentage >= 60 ? T.success : T.danger }}>
              {r.percentage}٪
            </div>
            <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>
              {new Date(r.createdAt).toLocaleDateString("fa-IR")}
            </div>
          </div>
        </div>
      ))}

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
