"use client";

import { useEffect, useState } from "react";
import { T } from "./theme";
import { fieldLabel, fieldInput, primarySmallBtn, SectionTitle, EmptyNote } from "./ui";
import { useSchoolSettings } from "./api-hooks";

export function SettingsPage() {
  const { ready, settings, save } = useSchoolSettings();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings && !form) setForm(settings);
  }, [settings, form]);

  if (!ready || !form) return <EmptyNote text="در حال بارگذاری تنظیمات..." />;

  const submit = async () => {
    await save(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div style={{ paddingTop: 8 }}>
      <SectionTitle>اطلاعات مدرسه</SectionTitle>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "18px 16px", marginBottom: 20 }}>
        <label style={fieldLabel}>نام مدرسه</label>
        <input
          value={form.schoolName}
          onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
          style={{ ...fieldInput, marginBottom: 14 }}
        />
        <label style={fieldLabel}>شعار یا توضیح کوتاه</label>
        <input
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          style={{ ...fieldInput, marginBottom: 14 }}
        />
        <label style={fieldLabel}>راه ارتباطی پشتیبانی (اختیاری)</label>
        <input
          value={form.supportContact}
          onChange={(e) => setForm({ ...form, supportContact: e.target.value })}
          placeholder="مثلاً یک ایمیل یا شماره تماس"
          style={{ ...fieldInput, marginBottom: 4 }}
        />
      </div>

      <button onClick={submit} style={{ ...primarySmallBtn, width: "100%", padding: "13px 0" }}>
        {saved ? "ذخیره شد ✓" : "ذخیره تنظیمات"}
      </button>

      <SectionTitle>درباره‌ی کیان</SectionTitle>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "16px 16px" }}>
        <div style={{ fontSize: 12.5, color: T.textSoft, lineHeight: 2, wordBreak: "keep-all" }}>
          کیان یک پلتفرم مدیریت آموزشی برای مدیر، معلم و دانش‌آموز است.
        </div>
        <div style={{ fontSize: 11.5, color: T.textFaint, marginTop: 10 }}>نسخه ۱٫۰</div>
      </div>
    </div>
  );
}
