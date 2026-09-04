export function serializeUser(u) {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role,
    teacherId: u.teacherId || null,
    status: u.active ? "فعال" : "غیرفعال",
  };
}

export function serializeQuestion(q) {
  const similar = Array.isArray(q.similar) ? q.similar : q.similar ? [q.similar] : [];
  return {
    id: q.id,
    text: q.text,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    similar,
    imageUrl: q.imageUrl || null,
  };
}

export function serializeAssignment(a) {
  const base = {
    id: a.id,
    title: a.title,
    questionIds: a.questionIds,
    studentIds: a.studentIds,
    status: a.active ? "فعال" : "غیرفعال",
    expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
  };
  if (a.type === "EXERCISE") {
    return { ...base, description: a.description || "" };
  }
  return { ...base, duration: a.duration ?? 20 };
}

export function serializeResult(r) {
  return {
    id: r.id,
    studentId: r.studentId,
    assignmentId: r.assignmentId,
    type: r.type === "EXAM" ? "exam" : "exercise",
    percentage: r.percentage,
    correctCount: r.correctCount,
    wrongCount: r.wrongCount,
    unansweredCount: r.unansweredCount,
    answerDetail: r.answerDetail || null,
    createdAt: r.createdAt.toISOString(),
  };
}

export function serializeExitEvent(e) {
  return {
    id: e.id,
    studentId: e.studentId,
    studentName: e.studentName,
    assignmentId: e.assignmentId,
    assignmentTitle: e.assignmentTitle,
    createdAt: e.createdAt.toISOString(),
  };
}

export function serializeLecture(l, { views, myView } = {}) {
  const base = {
    id: l.id,
    title: l.title,
    videoUrl: l.videoUrl,
    teacherId: l.teacherId,
    studentIds: l.studentIds,
    createdAt: l.createdAt.toISOString(),
  };
  if (views) {
    base.views = views.map((v) => ({
      studentId: v.studentId,
      watchedSeconds: v.watchedSeconds,
      durationSeconds: v.durationSeconds,
      completed: v.completed,
    }));
  }
  if (myView !== undefined) {
    base.myView = myView
      ? { watchedSeconds: myView.watchedSeconds, durationSeconds: myView.durationSeconds, completed: myView.completed }
      : null;
  }
  return base;
}

export function serializeMessage(m) {
  return {
    id: m.id,
    senderId: m.senderId,
    receiverId: m.receiverId,
    text: m.text,
    attachmentUrl: m.attachmentUrl || null,
    attachmentType: m.attachmentType || null,
    isRead: m.isRead,
    createdAt: m.createdAt.toISOString(),
  };
}
