type NetworkGearProps = {
  className?: string;
};

const TOOTH_ANGLES = [0, 60, 120, 180, 240, 300] as const;

/**
 * «چرخ شبکه» — نشان اختصاصی ادمین‌های آفگرید؛
 * پارادوکس عمدی برند OffGrid: ادمین نگهبانِ خودِ شبکه است.
 * چرخدنده‌ی شش‌دندانه با دره‌ی گرد، هاب مرکزیِ پر
 * و سه گره ماهواره‌ای که با خطوط ظریف به هاب متصل‌اند (کمی نامتقارن تا زنده باشد).
 */
export function NetworkGear({ className }: NetworkGearProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* تاج چرخدنده */}
      <circle cx={12} cy={12} r={8.6} />
      {TOOTH_ANGLES.map((angle) => (
        <rect key={angle} x={20} y={10.9} width={2.4} height={2.2} rx={1.1} transform={`rotate(${angle} 12 12)`} />
      ))}

      {/* اتصالات شبکه: گره‌ها به هاب */}
      <g strokeWidth={1.2}>
        <path d="M12 12 L10.4 7.7" />
        <path d="M12 12 L16.5 13.2" />
        <path d="M12 12 L10.5 16.1" />
      </g>

      {/* هاب مرکزی (پر) */}
      <circle cx={12} cy={12} r={1.5} fill="currentColor" stroke="none" />

      {/* سه گره ماهواره‌ای */}
      <circle cx={10.4} cy={7.7} r={0.9} />
      <circle cx={16.5} cy={13.2} r={0.9} />
      <circle cx={10.5} cy={16.1} r={0.9} />
    </svg>
  );
}
