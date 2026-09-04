"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, X, Video, ArrowRight, CheckCircle2, Clock } from "lucide-react";
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
import { useLectures } from "./api-hooks";

async function uploadLectureVideo(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", "lecture-video");
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "آپلود ویدیو ممکن نشد.");
  return data.url;
}

export function LectureManager({ students }) {
  const { ready, lectures, create, remove } = useLectures();
  const [view, setView] = useState("list");

  if (!ready) return <EmptyNote text="در حال بارگذاری..." />;

  if (view === "form") {
    return (
      <LectureForm
        students={students}
        onCancel={() => setView("list")}
        onSave={async (data) => {
          await create(data);
          setView("list");
        }}
      />
    );
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <SectionTitle>ویدیوهای آموزشی</SectionTitle>

      <button onClick={() => setView("form")} style={aiButton}>
        <Plus size={15} /> ویدیوی جدید
      </button>

      {lectures.length === 0 && <EmptyNote text="هنوز ویدیویی آپلود نشده است." />}

      {lectures.map((l) => {
        const views = l.views || [];
        const doneCount = views.filter((v) => v.completed).length;
        const notDone = l.studentIds
          .map((sid) => students.find((s) => s.id === sid))
          .filter(Boolean)
          .filter((s) => !views.find((v) => v.studentId === s.id && v.completed));
        return (
          <div key={l.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, wordBreak: "keep-all" }}>{l.title}</div>
              <span style={{ fontSize: 11, color: T.success, background: T.successSoft, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
                {doneCount}/{l.studentIds.length} دیده‌اند
              </span>
            </div>
            {notDone.length > 0 && (
              <div style={{ fontSize: 11.5, color: T.warning, marginTop: 8, wordBreak: "keep-all" }}>
                هنوز کامل ندیده‌اند: {notDone.map((s) => s.name).join("، ")}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={() => remove(l.id)} style={{ ...ghostSmallBtn, color: T.danger }}>
                <Trash2 size={13} /> حذف
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LectureForm({ students, onCancel, onSave }) {
  const [title, setTitle] = useState("");
  const [studentIds, setStudentIds] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const allSelected = students.length > 0 && studentIds.length === students.length;
  const toggleStudent = (id) => {
    setStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadLectureVideo(file);
      setVideoUrl(url);
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
  };

  const submit = async () => {
    if (!title.trim()) return setError("عنوان را وارد کنید.");
    if (!videoUrl) return setError("ابتدا فایل ویدیو را آپلود کنید.");
    if (studentIds.length === 0) return setError("حداقل یک دانش‌آموز را انتخاب کنید.");
    setError("");
    try {
      await onSave({ title: title.trim(), videoUrl, studentIds });
    } catch (err) {
      setError(err.message || "خطایی رخ داد.");
    }
  };

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SectionTitleInline>ویدیوی جدید</SectionTitleInline>
        <button onClick={onCancel} style={iconBtn}>
          <X size={18} />
        </button>
      </div>

      <label style={fieldLabel}>عنوان</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ ...fieldInput, marginBottom: 14 }} />

      <label style={fieldLabel}>فایل ویدیو</label>
      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFile} style={{ display: "none" }} />
      {videoUrl ? (
        <div style={{ marginBottom: 14 }}>
          <video src={videoUrl} controls style={{ width: "100%", borderRadius: 14, border: `1px solid ${T.border}` }} />
          <button onClick={() => fileInputRef.current?.click()} style={{ ...ghostSmallBtn, marginTop: 8 }}>
            تعویض ویدیو
          </button>
        </div>
      ) : (
        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ ...aiButton, opacity: uploading ? 0.6 : 1 }}>
          <Video size={15} /> {uploading ? "در حال آپلود..." : "انتخاب و آپلود فایل ویدیو"}
        </button>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
        <SectionTitleInline>تخصیص به دانش‌آموزان</SectionTitleInline>
        <button
          onClick={() => setStudentIds(allSelected ? [] : students.map((s) => s.id))}
          style={{ ...ghostSmallBtn, fontSize: 11.5 }}
        >
          {allSelected ? "لغو انتخاب همه" : "انتخاب همه"}
        </button>
      </div>
      <div style={{ marginTop: 10, marginBottom: 16 }}>
        {students.length === 0 && <EmptyNote text="دانش‌آموزی وجود ندارد." />}
        {students.map((s) => (
          <CheckRow key={s.id} label={s.name} sub={s.username} checked={studentIds.includes(s.id)} onToggle={() => toggleStudent(s.id)} />
        ))}
      </div>

      {error && <div style={{ color: T.danger, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

      <button onClick={submit} style={{ ...primarySmallBtn, width: "100%", padding: "13px 0" }}>
        ذخیره ویدیو
      </button>
    </div>
  );
}

export function StudentLecturesSection({ lectures, onOpen }) {
  if (lectures.length === 0) return null;
  return (
    <>
      <SectionTitle>ویدیوهای آموزشی</SectionTitle>
      {lectures.map((l) => {
        const done = l.myView?.completed;
        return (
          <button
            key={l.id}
            onClick={() => onOpen(l)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              padding: "13px 14px",
              marginBottom: 8,
              cursor: "pointer",
              textAlign: "right",
              fontFamily: FONT,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: T.purpleSoft,
                  color: T.purple,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Video size={17} />
              </div>
              <span style={{ fontSize: 13.5, color: T.text, wordBreak: "keep-all" }}>{l.title}</span>
            </div>
            {done ? <CheckCircle2 size={17} color={T.success} /> : <Clock size={16} color={T.textFaint} />}
          </button>
        );
      })}
    </>
  );
}

export function LecturePlayerView({ lecture, onExit, onProgress }) {
  const videoRef = useRef(null);
  const lastReportRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const report = () => {
      if (!video.duration) return;
      onProgress(Math.floor(video.currentTime), Math.floor(video.duration));
    };

    const onTimeUpdate = () => {
      if (video.currentTime - lastReportRef.current >= 5) {
        lastReportRef.current = video.currentTime;
        report();
      }
    };
    const onPauseOrEnd = () => report();

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("pause", onPauseOrEnd);
    video.addEventListener("ended", onPauseOrEnd);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("pause", onPauseOrEnd);
      video.removeEventListener("ended", onPauseOrEnd);
      report();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ paddingTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={onExit} style={iconBtn}>
          <ArrowRight size={20} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.text, wordBreak: "keep-all" }}>{lecture.title}</span>
      </div>
      <video ref={videoRef} src={lecture.videoUrl} controls autoPlay style={{ width: "100%", borderRadius: 16, background: "#000" }} />
      {lecture.myView?.completed && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, color: T.success, fontSize: 12.5 }}>
          <CheckCircle2 size={15} /> این ویدیو رو کامل دیدی
        </div>
      )}
    </div>
  );
}
