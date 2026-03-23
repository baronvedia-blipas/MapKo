export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      {/* Mesh gradient */}
      <div className="absolute top-[-30%] left-[-10%] w-[600px] h-[600px] bg-blue-500/[0.06] rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-5%] w-[500px] h-[500px] bg-purple-500/[0.04] rounded-full blur-[100px]" />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-cyan-500/[0.03] rounded-full blur-[80px]" />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
