interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
}

const sizes = {
  sm: { text: "text-2xl", icon: "w-8 h-8 text-lg" },
  md: { text: "text-3xl", icon: "w-10 h-10 text-xl" },
  lg: { text: "text-5xl", icon: "w-14 h-14 text-2xl" },
  xl: { text: "text-7xl md:text-8xl", icon: "w-20 h-20 text-4xl" },
};

export default function Logo({ size = "md", showSubtitle = false }: LogoProps) {
  const s = sizes[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-3">
        <div className={`${s.icon} rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg rotate-[-6deg] hover:rotate-0 transition-transform duration-500`}>
          <span className="text-white font-black">ש</span>
        </div>
        <span className={`${s.text} font-black gradient-text-fun tracking-tight`}>
          שקדול
        </span>
      </div>
      {showSubtitle && (
        <span className="text-sm text-gray-400 font-medium">השפה שהיא רק שלנו</span>
      )}
    </div>
  );
}
