import { forwardRef } from "react";
import { useI18n } from "@/lib/i18n";
import type { CvSection } from "@/lib/types";

/**
 * CV document renderer. Colors are plain hex on purpose: this is a printable
 * paper document, and the PDF export rasterises exactly what is rendered here.
 */

const TEAL = "#0f7d7d";
const INK = "#1c2a3a";
const SOFT = "#5b6b7c";
const LINE = "#dfe6ec";

export type TemplateId = "classic" | "modern" | "compact";

export const CV_DOC_WIDTH = 794; // A4 width at 96dpi

interface Props {
  cv: CvSection;
  template: string;
  /** Scale down for thumbnails. */
  scale?: number;
  /**
   * Force English labels + LTR. Used for the PDF export, because the canvas
   * rasteriser does not shape Arabic script correctly.
   */
  forExport?: boolean;
}

export const CvDocument = forwardRef<HTMLDivElement, Props>(function CvDocument(
  { cv, template, scale = 1, forExport = false },
  ref,
) {
  const i18n = useI18n();
  const t = forExport ? (s: string) => s : i18n.t;
  const dir = forExport ? "ltr" : i18n.dir;
  const id = (["classic", "modern", "compact"].includes(template)
    ? template
    : "classic") as TemplateId;

  const contact = [cv.personal.email, cv.personal.phone, cv.personal.location]
    .filter(Boolean)
    .join("  ·  ");

  const body = (
    <>
      {cv.personal.summary && (
        <Section id={id} title={t("Summary")}>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{cv.personal.summary}</p>
        </Section>
      )}
      {cv.education.length > 0 && (
        <Section id={id} title={t("Education")}>
          {cv.education.map((e) => (
            <div key={`${e.degree}-${e.school}`} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>{e.degree}</div>
              <div style={{ color: SOFT, fontSize: 12 }}>
                {e.school} · {e.period}
                {e.gpa ? ` · GPA ${e.gpa}` : ""}
              </div>
            </div>
          ))}
        </Section>
      )}
      {cv.experience.length > 0 && (
        <Section id={id} title={t("Experience")}>
          {cv.experience.map((e) => (
            <div key={`${e.role}-${e.company}`} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>
                {e.role} — {e.company}
              </div>
              <div style={{ color: SOFT, fontSize: 12 }}>{e.period}</div>
              <div style={{ lineHeight: 1.6 }}>{e.summary}</div>
            </div>
          ))}
        </Section>
      )}
      {cv.projects.length > 0 && (
        <Section id={id} title={t("Projects")}>
          {cv.projects.map((p) => (
            <div key={p.name} style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>{p.name}</span> — {p.description}
            </div>
          ))}
        </Section>
      )}
      {cv.skills.length > 0 && (
        <Section id={id} title={t("Skills")}>
          {id === "compact" ? (
            <p style={{ margin: 0, lineHeight: 1.7 }}>{cv.skills.join(" · ")}</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {cv.skills.map((s) => (
                <span
                  key={s}
                  style={{
                    background: id === "modern" ? "#e7f4f4" : "#f1f5f8",
                    color: id === "modern" ? TEAL : INK,
                    borderRadius: 999,
                    padding: "3px 10px",
                    fontSize: 12,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </Section>
      )}
      {cv.certifications.length > 0 && (
        <Section id={id} title={t("Certifications")}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>{cv.certifications.join(" · ")}</p>
        </Section>
      )}
      {cv.languages.length > 0 && (
        <Section id={id} title={t("Languages")}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>{cv.languages.join(" · ")}</p>
        </Section>
      )}
    </>
  );

  return (
    <div
      style={{
        width: CV_DOC_WIDTH * scale,
        transformOrigin: dir === "rtl" ? "top right" : "top left",
      }}
    >
      <div
        ref={ref}
        dir={dir}
        style={{
          width: CV_DOC_WIDTH,
          minHeight: 1123,
          background: "#ffffff",
          color: INK,
          fontFamily: '"Plus Jakarta Sans", system-ui, "Segoe UI", sans-serif',
          fontSize: 13.5,
          transform: scale === 1 ? undefined : `scale(${scale})`,
          transformOrigin: dir === "rtl" ? "top right" : "top left",
        }}
      >
        {id === "classic" && (
          <div style={{ padding: 48 }}>
            <div
              style={{
                borderBottom: `3px solid ${TEAL}`,
                paddingBottom: 14,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              <h1 style={{ margin: 0, fontSize: 30, letterSpacing: "-0.01em" }}>
                {cv.personal.fullName}
              </h1>
              <div style={{ color: TEAL, fontWeight: 600, marginTop: 4 }}>{cv.personal.title}</div>
              <div style={{ color: SOFT, fontSize: 12, marginTop: 6 }}>{contact}</div>
            </div>
            {body}
          </div>
        )}

        {id === "modern" && (
          <div>
            <div style={{ background: TEAL, color: "#ffffff", padding: "34px 44px" }}>
              <h1 style={{ margin: 0, fontSize: 32 }}>{cv.personal.fullName}</h1>
              <div style={{ marginTop: 4, opacity: 0.92, fontWeight: 600 }}>
                {cv.personal.title}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>{contact}</div>
            </div>
            <div style={{ padding: "26px 44px 48px" }}>{body}</div>
          </div>
        )}

        {id === "compact" && (
          <div style={{ padding: 36, fontSize: 12.5 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                borderBottom: `1px solid ${LINE}`,
                paddingBottom: 10,
                marginBottom: 16,
              }}
            >
              <div>
                <h1 style={{ margin: 0, fontSize: 24 }}>{cv.personal.fullName}</h1>
                <div style={{ color: TEAL, fontWeight: 600 }}>{cv.personal.title}</div>
              </div>
              <div style={{ color: SOFT, fontSize: 11, textAlign: dir === "rtl" ? "left" : "right" }}>
                {cv.personal.email}
                <br />
                {cv.personal.phone}
                <br />
                {cv.personal.location}
              </div>
            </div>
            {body}
          </div>
        )}
      </div>
    </div>
  );
});

function Section({
  id,
  title,
  children,
}: {
  id: TemplateId;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: id === "compact" ? 12 : 18 }}>
      <h2
        style={{
          margin: "0 0 8px",
          fontSize: id === "compact" ? 11 : 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TEAL,
          borderBottom: id === "classic" ? `1px solid ${LINE}` : "none",
          paddingBottom: id === "classic" ? 4 : 0,
        }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}
