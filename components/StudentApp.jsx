"use client";

import { useEffect, useState } from "react";
import { Home, ClipboardList, FileText, MessageCircle, User, LogOut, ChevronLeft } from "lucide-react";
import { T, FONT } from "./theme";
import { GlassPanel, SectionTitle, Timeline, ThemeToggle, EmptyNote, AccountCard, logoutBtn } from "./ui";
import { useAssignments, useQuestions, useResults, useExitEvents, useMessages } from "./api-hooks";
import { SolvingView, ResultView } from "./Solving";
import { ChatViewWithRead } from "./Messages";

function ProgressLine({ label, value, total, suffix = "", color }) {
  const pct = Math.min(100, Math.round((value / total) * 100));
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: T.textSoft, marginBottom: 6 }}>
        <span style={{ wordBreak: "keep-all" }}>{label}</span>
        <span style={{ color: T.text, fontWeight: 700 }}>
          {value}{suffix} / {total}{suffix}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: T.border, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function TaskCard({ title, meta, progress, status, statusColor, exam, onStart }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, wordBreak: "keep-all" }}>{title}</div>
          <div style={{ fontSize: 12, color: T.textFaint, marginTop: 3 }}>{meta}</div>
        </div>
        <span style={{ fontSize: 11, color: statusColor, background: T.bg, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
          {status}
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: T.border, overflow: "hidden", marginTop: 12 }}>
        <div style={{ width: `${progress}%`, height: "100%", background: T.blue, borderRadius: 999 }} />
      </div>
      <button
        onClick={onStart}
        style={{
          marginTop: 12,
          border: "none",
          background: "transparent",
          color: T.blue,
          fontFamily: FONT,
          fontSize: 12.5,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {progress === 0 ? (exam ? "شروع آزمون" : "شروع تمرین") : "مشاهده نتیجه"}
        <ChevronLeft size={14} />
      </button>
    </div>
  );
}

function BottomNav({ tabs, active, onSelect }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingBottom: "env(safe-area-inset-bottom, 10px)" }}>
      <div
        style={{
          margin: "0 14px 14px",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${T.border}`,
          borderRadius: 22,
          boxShadow: "0 14px 30px -16px rgba(28,35,51,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "8px 6px",
          position: "relative",
        }}
      >
        {tabs.map((t) =>
          t.center ? (
            <button
              key={t.key}
              onClick={() => onSelect(t.key)}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: "none",
                marginTop: -26,
                background: active === t.key ? T.amber : T.surface,
                color: active === t.key ? "#fff" : T.blue,
                boxShadow: "0 10px 22px -8px rgba(184,114,42,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {t.icon}
            </button>
          ) : (
            <button
              key={t.key}
              onClick={() => onSelect(t.key)}
              style={{
                border: "none",
                background: "transparent",
                color: active === t.key ? T.blue : T.textFaint,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                cursor: "pointer",
                fontFamily: FONT,
                padding: "4px 6px",
              }}
            >
              {t.icon}
              <span style={{ fontSize: 10.5, wordBreak: "keep-all" }}>{t.label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}

export function StudentApp({ user, onLogout, dark, onToggleTheme }) {
  const [tab, setTab] = useState("home");
  const [active, setActive] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const { items: allExercises } = useAssignments("exercise");
  const { items: allExams } = useAssignments("exam");
  const { questions } = useQuestions();
  const { results, add: addResult } = useResults();
  const { add: addExitEvent } = useExitEvents(false);
  const { ready: msgReady, messages, send: sendMessage, markRead } = useMessages();

  const teacher = useTeacher(user.teacherId);

  const myExercises = allExercises.filter((it) => it.studentIds.includes(user.id));
  const myExams = allExams.filter((it) => it.studentIds.includes(user.id));
  const myResults = results.filter((r) => r.studentId === user.id);

  const resultFor = (assignmentId) => myResults.find((r) => r.assignmentId === assignmentId);

  const doneExercises = myExercises.filter((it) => resultFor(it.id)).length;
  const doneExams = myExams.filter((it) => resultFor(it.id)).length;
  const avgPct = myResults.length ? Math.round(myResults.reduce((s, r) => s + r.percentage, 0) / myResults.length) : 0;

  const finishAssignment = async (result) => {
    const created = await addResult(result);
    setLastResult(created);
    setActive(null);
  };

  const tabs = [
    { key: "exercises", label: "تمرین‌ها", icon: <ClipboardList size={20} /> },
    { key: "exams", label: "آزمون‌ها", icon: <FileText size={20} /> },
    { key: "home", label: "خانه", icon: <Home size={22} />, center: true },
    { key: "messages", label: "پیام‌ها", icon: <MessageCircle size={20} /> },
    { key: "account", label: "حساب", icon: <User size={20} /> },
  ];

  if (active) {
    return (
      <div style={{ position: "relative", minHeight: 560, background: T.bg, fontFamily: FONT, padding: "0 18px 24px" }}>
        <SolvingView
          assignment={active.item}
          type={active.type}
          questions={questions}
          student={user}
          onExit={() => setActive(null)}
          onFinish={finishAssignment}
          onExitEvent={addExitEvent}
        />
      </div>
    );
  }

  if (lastResult) {
    return (
      <div style={{ position: "relative", minHeight: 560, background: T.bg, fontFamily: FONT, padding: "0 18px 24px" }}>
        <ResultView result={lastResult} onClose={() => setLastResult(null)} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: 560, background: T.bg, fontFamily: FONT, paddingBottom: 84, overflow: "hidden" }}>
      <div style={{ padding: "18px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>کیان</span>
        <ThemeToggle dark={dark} onToggle={onToggleTheme} size={16} />
      </div>

      <div style={{ padding: "0 18px 8px" }}>
        {tab === "home" && (
          <>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", color: T.text }}>سلام، {user.name.split(" ")[0]}</div>
              <div style={{ fontSize: 13, color: T.textSoft, marginTop: 4, wordBreak: "keep-all" }}>
                امروز آماده‌ای یک قدم جلوتر بری؟
              </div>
            </div>

            <SectionTitle>پیشرفت من</SectionTitle>
            <GlassPanel style={{ padding: "16px 16px" }}>
              <ProgressLine label="تمرین‌های انجام‌شده" value={doneExercises} total={Math.max(myExercises.length, 1)} color={T.blue} />
              <ProgressLine label="آزمون‌های انجام‌شده" value={doneExams} total={Math.max(myExams.length, 1)} color={T.purple} />
              <ProgressLine label="درصد موفقیت" value={avgPct} total={100} suffix="٪" color={T.success} />
            </GlassPanel>

            <SectionTitle>آخرین فعالیت‌ها</SectionTitle>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "16px 16px" }}>
              {myResults.length === 0 && <EmptyNote text="هنوز فعالیتی ثبت نشده است." />}
              {myResults.length > 0 && (
                <Timeline
                  items={myResults.slice(0, 4).map((r) => {
                    const src = r.type === "exam" ? allExams : allExercises;
                    const title = src.find((it) => it.id === r.assignmentId)?.title || "فعالیت";
                    return {
                      title: `${r.type === "exam" ? "آزمون" : "تمرین"} «${title}» با ${r.percentage}٪ تکمیل شد.`,
                      time: new Date(r.createdAt).toLocaleDateString("fa-IR"),
                      color: r.percentage >= 60 ? T.success : T.warning,
                    };
                  })}
                />
              )}
            </div>
          </>
        )}

        {tab === "exercises" && (
          <div style={{ paddingTop: 14 }}>
            <SectionTitle>تمرین‌ها</SectionTitle>
            {myExercises.length === 0 && <EmptyNote text="هنوز تمرینی برای شما قرار نگرفته است." />}
            {myExercises.map((it) => {
              const r = resultFor(it.id);
              return (
                <TaskCard
                  key={it.id}
                  title={it.title}
                  meta={`${it.questionIds.length} سؤال`}
                  progress={r ? 100 : 0}
                  status={r ? `تکمیل‌شده — ${r.percentage}٪` : "جدید"}
                  statusColor={r ? T.success : T.blue}
                  onStart={() => (r ? setLastResult(r) : setActive({ type: "exercise", item: it }))}
                />
              );
            })}
          </div>
        )}

        {tab === "exams" && (
          <div style={{ paddingTop: 14 }}>
            <SectionTitle>آزمون‌ها</SectionTitle>
            {myExams.length === 0 && <EmptyNote text="هنوز آزمونی برای شما قرار نگرفته است." />}
            {myExams.map((it) => {
              const r = resultFor(it.id);
              return (
                <TaskCard
                  key={it.id}
                  title={it.title}
                  meta={`${it.questionIds.length} سؤال · ${it.duration} دقیقه`}
                  progress={r ? 100 : 0}
                  status={r ? `تکمیل‌شده — ${r.percentage}٪` : "در انتظار شروع"}
                  statusColor={r ? T.success : T.warning}
                  exam
                  onStart={() => (r ? setLastResult(r) : setActive({ type: "exam", item: it }))}
                />
              );
            })}
          </div>
        )}

        {tab === "messages" && (
          <div style={{ paddingTop: 14 }}>
            {!teacher && <EmptyNote text="معلمی برای گفت‌وگو تعریف نشده است." />}
            {teacher && msgReady && (
              <ChatViewWithRead user={user} teacher={teacher} messages={messages} sendMessage={sendMessage} markRead={markRead} />
            )}
          </div>
        )}

        {tab === "account" && (
          <div style={{ paddingTop: 14 }}>
            <SectionTitle>حساب کاربری</SectionTitle>
            <AccountCard name={user.name} username={user.username} role="دانش‌آموز" />
            <button onClick={onLogout} style={logoutBtn}>
              <LogOut size={16} /> خروج از حساب
            </button>
          </div>
        )}
      </div>

      <BottomNav tabs={tabs} active={tab} onSelect={setTab} />
    </div>
  );
}

function useTeacher(teacherId) {
  const [teacher, setTeacher] = useState(null);
  useEffect(() => {
    if (!teacherId) {
      setTeacher(null);
      return;
    }
    fetch(`/api/users/${teacherId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setTeacher)
      .catch(() => {});
  }, [teacherId]);
  return teacher;
}
