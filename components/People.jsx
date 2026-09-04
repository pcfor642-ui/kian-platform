"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, User, AtSign, Lock, GraduationCap } from "lucide-react";
import { T, FONT } from "./theme";
import {
  fieldLabel,
  fieldInput,
  iconBtn,
  primaryIconBtn,
  ghostSmallBtn,
  primarySmallBtn,
  SectionTitleInline,
  EmptyNote,
} from "./ui";
import { useUsers } from "./api-hooks";

export function PeopleManager({ roleLabel, filterRole, teacherOptions, fixedTeacherId, onEnterPanel }) {
  const { ready, users, create, update, remove } = useUsers(filterRole);
  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const list = fixedTeacherId ? users.filter((u) => u.teacherId === fixedTeacherId) : users;

  const openNew = () => {
    setEditing({
      id: null,
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      status: "فعال",
      teacherId: fixedTeacherId || (teacherOptions && teacherOptions[0] ? teacherOptions[0].id : ""),
    });
    setError("");
    setView("form");
  };

  const openEdit = (u) => {
    const parts = u.name.split(" ");
    setEditing({
      id: u.id,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      username: u.username,
      password: "",
      status: u.status || "فعال",
      teacherId: u.teacherId || "",
    });
    setError("");
    setView("form");
  };

  const toggleStatus = async (u) => {
    const parts = u.name.split(" ");
    await update(u.id, {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      username: u.username,
      status: u.status === "فعال" ? "غیرفعال" : "فعال",
      teacherId: u.teacherId || undefined,
    });
  };

  const submit = async (form) => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.username.trim() || (!form.id && !form.password.trim())) {
      setError("همه‌ی فیلدها را پر کنید.");
      return;
    }
    try {
      if (form.id) {
        await update(form.id, form);
      } else {
        await create(form);
      }
      setView("list");
    } catch (e) {
      setError(e.message || "خطایی رخ داد.");
    }
  };

  if (!ready) return <EmptyNote text="در حال بارگذاری..." />;

  if (view === "form") {
    return (
      <PersonForm
        roleLabel={roleLabel}
        initial={editing}
        error={error}
        teacherOptions={teacherOptions}
        showTeacherSelect={filterRole === "STUDENT" && !fixedTeacherId}
        onCancel={() => setView("list")}
        onSave={submit}
      />
    );
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SectionTitleInline>{roleLabel}</SectionTitleInline>
        <button onClick={openNew} style={primaryIconBtn}>
          <Plus size={18} />
        </button>
      </div>

      {list.length === 0 && <EmptyNote text="هنوز کسی اضافه نشده است." />}

      {list.map((u) => (
        <div key={u.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "13px 14px", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: T.purpleSoft,
                  color: T.purple,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {u.name.trim()[0]}
              </div>
              <div>
                <div style={{ fontSize: 13.5, color: T.text, wordBreak: "keep-all" }}>{u.name}</div>
                <div style={{ fontSize: 11.5, color: T.textFaint }}>{u.username}</div>
              </div>
            </div>
            <button
              onClick={() => toggleStatus(u)}
              style={{
                fontSize: 11,
                color: u.status === "فعال" ? T.success : T.textFaint,
                background: u.status === "فعال" ? T.successSoft : T.bg,
                padding: "4px 10px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              {u.status || "فعال"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={() => openEdit(u)} style={ghostSmallBtn}>
              <Pencil size={13} /> ویرایش
            </button>
            <button onClick={() => remove(u.id)} style={{ ...ghostSmallBtn, color: T.danger }}>
              <Trash2 size={13} /> حذف
            </button>
            {onEnterPanel && (
              <button onClick={() => onEnterPanel(u)} style={{ ...ghostSmallBtn, color: T.blue, borderColor: T.blue }}>
                ورود به پنل معلم
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function IconField({ icon, ...props }) {
  return (
    <div style={{ position: "relative", marginBottom: 12 }}>
      {icon}
      <input className="kian-input" {...props} style={{ ...fieldInput, paddingRight: 38, "--focus-ring-color": T.blue, "--focus-ring-glow": `${T.blue}22` }} />
    </div>
  );
}

function PersonForm({ roleLabel, initial, error, teacherOptions, showTeacherSelect, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const initials = (form.firstName?.trim()[0] || "") + (form.lastName?.trim()[0] || "");

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <SectionTitleInline>{form.id ? "ویرایش" : `${roleLabel} جدید`}</SectionTitleInline>
        <button onClick={onCancel} style={iconBtn}>
          <X size={18} />
        </button>
      </div>

      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.blue}, ${T.purple})`,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 18,
          margin: "0 auto 18px",
        }}
      >
        {initials || <User size={22} />}
      </div>

      <label style={fieldLabel}>نام</label>
      <IconField
        icon={<User size={15} color={T.textFaint} style={{ position: "absolute", top: 13, right: 13 }} />}
        value={form.firstName}
        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
      />

      <label style={fieldLabel}>نام خانوادگی</label>
      <IconField
        icon={<User size={15} color={T.textFaint} style={{ position: "absolute", top: 13, right: 13 }} />}
        value={form.lastName}
        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
      />

      <label style={fieldLabel}>نام کاربری</label>
      <IconField
        icon={<AtSign size={15} color={T.textFaint} style={{ position: "absolute", top: 13, right: 13 }} />}
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />

      <label style={fieldLabel}>رمز عبور {form.id && "(برای تغییر پر کنید، در غیر این صورت خالی بگذارید)"}</label>
      <IconField
        icon={<Lock size={15} color={T.textFaint} style={{ position: "absolute", top: 13, right: 13 }} />}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        placeholder={form.id ? "بدون تغییر" : ""}
      />

      {showTeacherSelect && (
        <>
          <label style={fieldLabel}>معلم</label>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <GraduationCap size={15} color={T.textFaint} style={{ position: "absolute", top: 13, right: 13, pointerEvents: "none" }} />
            <select
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className="kian-input"
              style={{ ...fieldInput, paddingRight: 38, "--focus-ring-color": T.blue, "--focus-ring-glow": `${T.blue}22` }}
            >
              {(!teacherOptions || teacherOptions.length === 0) && <option value="">معلمی وجود ندارد</option>}
              {teacherOptions &&
                teacherOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </div>
        </>
      )}

      <label style={fieldLabel}>وضعیت حساب</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["فعال", "غیرفعال"].map((s) => (
          <button
            key={s}
            onClick={() => setForm({ ...form, status: s })}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 12,
              border: `1px solid ${form.status === s ? T.blue : T.border}`,
              background: form.status === s ? T.blueSoft : T.surface,
              color: form.status === s ? T.blue : T.textSoft,
              fontFamily: FONT,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div style={{ color: T.danger, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

      <button onClick={() => onSave(form)} style={{ ...primarySmallBtn, width: "100%", padding: "13px 0" }}>
        ذخیره
      </button>
    </div>
  );
}
