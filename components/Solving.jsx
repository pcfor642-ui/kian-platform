"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { T, FONT } from "./theme";
import { iconBtn, primarySmallBtn, EmptyNote } from "./ui";

function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const toFa = (n) => n.toString().padStart(2, "0").replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
  return `${toFa(m)}:${toFa(s)}`;
}

function OptionButton({ label, state, onClick, disabled }) {
  const styles = {
    idle: { border: T.border, bg: "#fff", color: T.text },
    selected: { border: T.blue, bg: T.blueSoft, color: T.text },
    correct: { border: T.success, bg: T.successSoft, color: T.success },
    incorrect: { border: T.danger, bg: T.dangerSoft, color: T.danger },
  }[state];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        textAlign: "right",
        padding: "14px 16px",
        borderRadius: 14,
        border: `1.5px solid ${styles.border}`,
        background: styles.bg,
        color: styles.color,
        fontFamily: FONT,
        fontSize: 13.5,
        marginBottom: 10,
        cursor: disabled ? "default" : "pointer",
        wordBreak: "keep-all",
        overflowWrap: "break-word",
      }}
    >
      {label}
    </button>
  );
}

function QuestionPane({ question, onAnswered, isSimilar }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

  const isCorrect = submitted && selected === question.correctIndex;

  const optionState = (i) => {
    if (!submitted) return selected === i ? "selected" : "idle";
    if (i === question.correctIndex) return "correct";
    if (i === selected) return "incorrect";
    return "idle";
  };

  return (
    <div>
      {isSimilar && (
        <div style={{ fontSize: 11.5, color: T.purple, background: T.purpleSoft, display: "inline-block", padding: "4px 10px", borderRadius: 999, marginBottom: 10 }}>
          سؤال مشابه
        </div>
      )}
      <div style={{ fontSize: 15.5, color: T.text, fontWeight: 700, marginBottom: 16, wordBreak: "keep-all", overflowWrap: "break-word", lineHeight: 1.9 }}>
        {question.text}
      </div>

      {question.options.map((opt, i) => (
        <OptionButton key={i} label={opt} state={optionState(i)} disabled={submitted} onClick={() => setSelected(i)} />
      ))}

      {!submitted && (
        <button
          onClick={submit}
          disabled={selected === null}
          style={{
            ...primarySmallBtn,
            width: "100%",
            padding: "13px 0",
            opacity: selected === null ? 0.5 : 1,
            marginTop: 6,
          }}
        >
          ثبت پاسخ
        </button>
      )}

      {submitted && (
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: isCorrect ? T.success : T.danger, marginBottom: 6 }}>
            {isCorrect ? "پاسخ درست است" : "پاسخ اشتباه است"}
          </div>
          {!isCorrect && (
            <div style={{ fontSize: 12.5, color: T.textSoft, marginBottom: question.explanation ? 6 : 0 }}>
              پاسخ صحیح: {question.options[question.correctIndex]}
            </div>
          )}
          {question.explanation && (
            <div style={{ fontSize: 12.5, color: T.textFaint, marginBottom: 12, wordBreak: "keep-all" }}>
              توضیح معلم: {question.explanation}
            </div>
          )}
          <button onClick={() => onAnswered(isCorrect)} style={{ ...primarySmallBtn, width: "100%", padding: "13px 0" }}>
            {isSimilar ? "ادامه" : "سؤال بعدی"}
          </button>
        </div>
      )}
    </div>
  );
}

export function SolvingView({ assignment, type, questions, student, onExit, onFinish, onExitEvent }) {
  const qList = assignment.questionIds.map((id) => questions.find((q) => q.id === id)).filter(Boolean);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showSimilar, setShowSimilar] = useState(false);
  const [finished, setFinished] = useState(false);
  const isExam = type === "exam";
  const [remaining, setRemaining] = useState(isExam ? (assignment.duration || 20) * 60 : null);

  const current = qList[index];
  const progressPct = Math.round((index / qList.length) * 100);

  const finalizeResult = (finalAnswers, unansweredCount) => {
    if (finished) return;
    setFinished(true);
    const correctCount = finalAnswers.filter((a) => a.isCorrect).length;
    const wrongCount = finalAnswers.length - correctCount;
    const denom = finalAnswers.length + unansweredCount || 1;
    const result = {
      assignmentId: assignment.id,
      type,
      correctCount,
      wrongCount,
      unansweredCount,
      percentage: Math.round((correctCount / denom) * 100),
    };
    onFinish(result);
  };

  const goNextMain = (wasCorrect) => {
    const next = [...answers, { questionId: current.id, isCorrect: wasCorrect }];
    setAnswers(next);
    if (!wasCorrect && current.similar && current.similar.text.trim()) {
      setShowSimilar(true);
      return;
    }
    advance(next);
  };

  const advance = (finalAnswers) => {
    setShowSimilar(false);
    if (index + 1 < qList.length) {
      setIndex(index + 1);
    } else {
      finalizeResult(finalAnswers, 0);
    }
  };

  useEffect(() => {
    if (!isExam || finished || remaining === null) return;
    if (remaining <= 0) {
      finalizeResult(answers, qList.length - answers.length);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, isExam, finished]);

  useEffect(() => {
    if (!isExam || finished) return;
    const logExit = () => {
      onExitEvent &&
        onExitEvent({
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
        });
    };
    const onVisibility = () => {
      if (document.hidden) logExit();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", logExit);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", logExit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExam, finished]);

  if (!current) {
    return <EmptyNote text="سؤالی برای این مجموعه تعریف نشده است." />;
  }

  const timeCritical = isExam && remaining !== null && remaining < (assignment.duration || 20) * 60 * 0.2;

  return (
    <div style={{ paddingTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={onExit} style={iconBtn}>
          <ArrowRight size={20} />
        </button>
        <span style={{ fontSize: 12.5, color: T.textSoft }}>
          سؤال {index + 1} از {qList.length}
        </span>
        {isExam && remaining !== null ? (
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: timeCritical ? T.danger : T.blue,
              background: timeCritical ? T.dangerSoft : T.blueSoft,
              padding: "4px 10px",
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Clock size={13} /> {formatDuration(remaining)}
          </span>
        ) : (
          <span style={{ width: 20 }} />
        )}
      </div>
      <div style={{ height: 6, borderRadius: 999, background: T.border, overflow: "hidden", marginBottom: isExam ? 10 : 20 }}>
        <div style={{ width: `${progressPct}%`, height: "100%", background: T.blue, borderRadius: 999, transition: "width 200ms ease" }} />
      </div>
      {isExam && (
        <div style={{ fontSize: 11, color: T.textFaint, marginBottom: 16, wordBreak: "keep-all" }}>
          خروج از این صفحه در طول آزمون برای معلم ثبت می‌شود.
        </div>
      )}

      {!showSimilar && <QuestionPane key={current.id + "-main"} question={current} onAnswered={goNextMain} />}
      {showSimilar && (
        <QuestionPane key={current.id + "-similar"} question={current.similar} isSimilar onAnswered={() => advance([...answers])} />
      )}
    </div>
  );
}

export function ResultView({ result, onClose }) {
  return (
    <div style={{ paddingTop: 30, textAlign: "center" }}>
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: `conic-gradient(${T.blue} ${result.percentage}%, ${T.border} 0)`,
          margin: "0 auto 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: T.text }}>
          {result.percentage}٪
        </div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>آفرین! تمرین تموم شد</div>
      <div style={{ fontSize: 13, color: T.textSoft, marginBottom: 24 }}>عملکردت رو اینجا می‌بینی</div>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 26 }}>
        <ResultStat value={result.correctCount} label="پاسخ صحیح" color={T.success} />
        <ResultStat value={result.wrongCount} label="پاسخ غلط" color={T.danger} />
        <ResultStat value={result.unansweredCount} label="بدون پاسخ" color={T.textFaint} />
      </div>

      <button onClick={onClose} style={{ ...primarySmallBtn, padding: "12px 28px" }}>
        بازگشت
      </button>
    </div>
  );
}

function ResultStat({ value, label, color }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 16px", minWidth: 84 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2, wordBreak: "keep-all" }}>{label}</div>
    </div>
  );
}
