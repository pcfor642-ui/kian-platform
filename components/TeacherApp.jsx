"use client";

import { useState } from "react";
import { Home, Users, BookOpen, ClipboardList, FileText, TrendingUp, MessageCircle, User, LogOut, Video } from "lucide-react";
import { T, FONT } from "./theme";
import { GlassPanel, Greeting, SectionTitle, StatRow, PlaceholderPage, AccountCard, EmptyNote, logoutBtn, FollowUpRow } from "./ui";
import { AppShell } from "./AppShell";
import { useUsers, useAssignments, useQuestions, useResults, useExitEvents } from "./api-hooks";
import { QuestionBank } from "./QuestionBank";
import { AssignmentBank } from "./Assignments";
import { ResultsPage } from "./Results";
import { TeacherMessages } from "./Messages";
import { PeopleManager } from "./People";
import { LectureManager } from "./Lectures";

export function TeacherApp({ user, onLogout, impersonating, dark, onToggleTheme }) {
  const [page, setPage] = useState("home");

  const { users: allMyStudents } = useUsers("STUDENT");
  const myStudents = allMyStudents.filter((s) => s.teacherId === user.id);
  const myStudentIds = myStudents.map((s) => s.id);

  const { items: exercises } = useAssignments("exercise");
  const { items: exams } = useAssignments("exam");
  const { questions } = useQuestions();
  const { results } = useResults();
  const { events: exitEvents } = useExitEvents();

  const allAssignments = [...exercises.map((e) => ({ ...e, type: "exercise" })), ...exams.map((e) => ({ ...e, type: "exam" }))];
  const pending = [];
  allAssignments.forEach((a) => {
    a.studentIds.forEach((sid) => {
      if (!myStudentIds.includes(sid)) return;
      const done = results.some((r) => r.assignmentId === a.id && r.studentId === sid);
      if (!done) {
        const student = myStudents.find((s) => s.id === sid);
        if (student) pending.push({ student, assignment: a });
      }
    });
  });

  const activeExerciseCount = exercises.filter((e) => e.status === "فعال").length;
  const activeExamCount = exams.filter((e) => e.status === "فعال").length;

  const menu = [
    { key: "home", label: "خانه", icon: <Home size={18} /> },
    { key: "students", label: "دانش‌آموزان", icon: <Users size={18} /> },
    { key: "questions", label: "بانک سؤال", icon: <BookOpen size={18} /> },
    { key: "exercises", label: "تمرین‌ها", icon: <ClipboardList size={18} /> },
    { key: "exams", label: "آزمون‌ها", icon: <FileText size={18} /> },
    { key: "results", label: "نتایج", icon: <TrendingUp size={18} /> },
    { key: "lectures", label: "ویدیوهای آموزشی", icon: <Video size={18} /> },
    { key: "messages", label: "پیام‌ها", icon: <MessageCircle size={18} /> },
    { key: "account", label: "حساب کاربری", icon: <User size={18} /> },
  ];

  return (
    <AppShell title="پنل معلم" menu={menu} active={page} onSelect={setPage} dark={dark} onToggleTheme={onToggleTheme}>
      {page === "home" && (
        <>
          <GlassPanel style={{ padding: "20px 18px" }}>
            <Greeting name={user.name} subtitle={`${myStudents.length} دانش‌آموز زیر نظر شما هستند.`} />
          </GlassPanel>

          <SectionTitle>نمای کلی</SectionTitle>
          <StatRow
            items={[
              { icon: <Users size={18} />, value: myStudents.length, label: "دانش‌آموز" },
              { icon: <ClipboardList size={18} />, value: activeExerciseCount, label: "تمرین فعال", color: T.purple },
              { icon: <FileText size={18} />, value: activeExamCount, label: "آزمون فعال", color: T.warning },
              { icon: <BookOpen size={18} />, value: questions.length, label: "سؤال ساخته‌شده" },
            ]}
          />

          <SectionTitle>نیاز به پیگیری</SectionTitle>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: pending.length ? "6px 4px" : 0 }}>
            {pending.length === 0 && <EmptyNote text="فعلاً همه به‌روز هستند." />}
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
        </>
      )}

      {page === "students" && (
        <PeopleManager roleLabel="دانش‌آموزان من" filterRole="STUDENT" fixedTeacherId={user.id} />
      )}

      {page === "account" && (
        <div style={{ paddingTop: 8 }}>
          <SectionTitle>حساب کاربری</SectionTitle>
          <AccountCard name={user.name} username={user.username} role="معلم" />
          <button onClick={onLogout} style={logoutBtn}>
            <LogOut size={16} /> {impersonating ? "بازگشت به پنل مدیریت" : "خروج از حساب"}
          </button>
        </div>
      )}

      {page === "questions" && <QuestionBank roleLabel="معلم" />}
      {page === "exercises" && <AssignmentBank type="exercise" students={myStudents} />}
      {page === "exams" && <AssignmentBank type="exam" students={myStudents} />}
      {page === "results" && <ResultsPage students={myStudents} exercises={exercises} exams={exams} results={results} exitEvents={exitEvents} questions={questions} />}
      {page === "lectures" && <LectureManager students={myStudents} />}
      {page === "messages" && <TeacherMessages user={user} students={myStudents} />}

      {!["home", "students", "account", "questions", "exercises", "exams", "results", "lectures", "messages"].includes(page) && (
        <PlaceholderPage
          label={menu.find((m) => m.key === page)?.label}
          hint="این بخش در نسخه‌ی نمونه پیاده‌سازی نشده — در نسخه‌ی واقعی تکمیل می‌شود."
        />
      )}
    </AppShell>
  );
}
