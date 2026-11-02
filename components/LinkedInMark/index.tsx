/** LinkedIn's "in" badge, sized by `size` (px). */
export default function LinkedInMark({ size = 14 }: { size?: number }) {
  return (
    <span
      aria-label="LinkedIn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size * 0.2,
        background: "#0A66C2",
        color: "#fff",
        fontSize: size * 0.68,
        fontWeight: 700,
        lineHeight: 1,
        flex: "none",
      }}
    >
      in
    </span>
  );
}
