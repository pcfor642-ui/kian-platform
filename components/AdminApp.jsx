"use client";

import { useState } from "react";
import {
  Home, BookOpen, FileText, MessageCircle, Users, GraduationCap,
  ClipboardList, Settings, TrendingUp, LogOut, User,
} from "lucide-react";
import { T, FONT } from "./theme";
import { GlassPanel, SectionTitle, StatRow, Timeline, PlaceholderPage, AccountCard, logoutBtn } from "./ui";
import { AppShell } from "./AppShell";
import { useUsers, useAssignments, useResults, useExitEvents } from "./api-hooks";
import { QuestionBank } from "./QuestionBank";
import { AssignmentBank } from "./Assignments";
import { ResultsPage } from "./Results";
import { AdminMessages } from "./Messages";
import { PeopleManager } from "./People";
import { SettingsPage } from "./SettingsPage";
import { TeacherApp } from "./TeacherApp";

export function AdminApp({ user, onLogout, dark, onToggleTheme }) {
  const [page, setPage] = useState("home");
  const [viewingTeacherId, setViewingTeacherId] = useState(null);

  const { users: teachers } = useUsers("TEACHER");
  const { users: allStudents } = useUsers("STUDENT");

  const { items: exercises } = useAssignments("exercise");
  const { items: exams } = useAssignments("exam");
  const { results } = useResults();
  const { events: exitEvents } = useExitEvents();

  const teacherCount = teachers.length;
  const studentCount = allStudents.length;

  const menu = [
    { key: "home", label: "خانه", icon: <Home size={18} /> },
    { key: "teachers", label: "معلم‌ها", icon: <GraduationCap size={18} /> },
    { key: "students", label: "دانش‌آموزان", icon: <Users size={18} /> },
    { key: "questions", label: "بانک سؤال", icon: <BookOpen size={18} /> },
    { key: "exercises", label: "تمرین‌ها", icon: <ClipboardList size={18} /> },
    { key: "exams", label: "آزمون‌ها", icon: <FileText size={18} /> },
    { key: "results", label: "نتایج", icon: <TrendingUp size={18} /> },
    { key: "messages", label: "پیام‌ها", icon: <MessageCircle size={18} /> },
    { key: "account", label: "حساب کاربری", icon: <User size={18} /> },
    { key: "settings", label: "تنظیمات", icon: <Settings size={18} /> },
  ];

  if (viewingTeacherId) {
    const teacherUser = teachers.find((u) => u.id === viewingTeacherId);
    return (
      <div style={{ position: "relative", minHeight: "100vh", background: T.bg, fontFamily: FONT }}>
        <div
          style={{
            background: T.warningSoft,
            color: T.warning,
            fontSize: 12.5,
            textAlign: "center",
            padding: "9px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span style={{ wordBreak: "keep-all" }}>مشاهده پنل استاد {teacherUser?.name} …</span>
          <button onClick={() => setViewingTeacherId(null)} style={{ background: T.surface, color: T.text, padding: "4px 10px", borderRadius: 10, border: `1px solid ${T.border}`, cursor: "pointer", fontFamily: FONT, fontSize: 12 }}>
            بازگشت به پنل مدیریت
          </button>
        </div>
        {teacherUser && (
          <TeacherApp
            user={teacherUser}
            onLogout={() => setViewingTeacherId(null)}
            impersonating
            dark={dark}
            onToggleTheme={onToggleTheme}
          />
        )}
      </div>
    );
  }

  return (
    <AppShell title="پنل مدیریت" menu={menu} active={page} onSelect={setPage} dark={dark} onToggleTheme={onToggleTheme}>
      {page === "home" && (
        <>
          <GlassPanel style={{ padding: "20px 18px" }}>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em", color: T.text }}>سلام، {user.name}</div>
            <div style={{ fontSize: 13, color: T.textSoft, marginTop: 4 }}>
              امروز {teacherCount} معلم و {studentCount} دانش‌آموز فعال هستند.
            </div>
          </GlassPanel>

          <SectionTitle>آمار کلی</SectionTitle>
          <StatRow
            items={[
              { icon: <GraduationCap size={18} />, value: teacherCount, label: "معلم فعال" },
              { icon: <Users size={18} />, value: studentCount, label: "دانش‌آموز" },
              { icon: <ClipboardList size={18} />, value: exercises.filter((e) => e.status === "فعال").length, label: "تمرین فعال", color: T.purple },
              { icon: <FileText size={18} />, value: exams.filter((e) => e.status === "فعال").length, label: "آزمون فعال", color: T.warning },
            ]}
          />

          <SectionTitle>فعالیت‌های اخیر</SectionTitle>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "16px 16px" }}>
            {results.length === 0 ? (
              <div style={{ fontSize: 13, color: T.textFaint, textAlign: "center", padding: "10px 0" }}>
                هنوز فعالیتی ثبت نشده است.
              </div>
            ) : (
              <Timeline
                items={results.slice(0, 4).map((r) => {
                  const src = r.type === "exam" ? exams : exercises;
                  const title = src.find((it) => it.id === r.assignmentId)?.title || "فعالیت";
                  const student = allStudents.find((s) => s.id === r.studentId);
                  return {
                    title: `${student?.name || "دانش‌آموز"} — ${r.type === "exam" ? "آزمون" : "تمرین"} «${title}» را با ${r.percentage}٪ تکمیل کرد.`,
                    time: new Date(r.createdAt).toLocaleDateString("fa-IR"),
                  };
                })}
              />
            )}
          </div>
        </>
      )}

      {page === "teachers" && (
        <PeopleManager roleLabel="معلم‌ها" filterRole="TEACHER" onEnterPanel={(t) => setViewingTeacherId(t.id)} />
      )}

      {page === "students" && (
        <PeopleManager roleLabel="دانش‌آموزان" filterRole="STUDENT" teacherOptions={teachers} />
      )}

      {page === "account" && (
        <div style={{ paddingTop: 8 }}>
          <SectionTitle>حساب کاربری</SectionTitle>
          <AccountCard name={user.name} username={user.username} role="مدیر" />
          <button onClick={onLogout} style={logoutBtn}>
            <LogOut size={16} /> خروج از حساب
          </button>
        </div>
      )}

      {page === "questions" && <QuestionBank roleLabel="مدیر" />}
      {page === "exercises" && <AssignmentBank type="exercise" students={allStudents} />}
      {page === "exams" && <AssignmentBank type="exam" students={allStudents} />}
      {page === "results" && <ResultsPage students={allStudents} exercises={exercises} exams={exams} results={results} exitEvents={exitEvents} />}
      {page === "messages" && <AdminMessages user={user} teachers={teachers} students={allStudents} />}
      {page === "settings" && <SettingsPage />}

      {!["home", "teachers", "students", "account", "questions", "exercises", "exams", "results", "messages", "settings"].includes(page) && (
        <PlaceholderPage
          label={menu.find((m) => m.key === page)?.label}
          hint="این بخش در نسخه‌ی نمونه پیاده‌سازی نشده — در نسخه‌ی واقعی تکمیل می‌شود."
        />
      )}
    </AppShell>
  );
}
