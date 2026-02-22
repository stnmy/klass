const LoadingScreen = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-brand-bg gap-6">
    <div className="w-10 h-10 border-4 border-brand-light/20 border-t-brand-teal rounded-full animate-spin" />
    <p className="text-brand-deep font-black tracking-[0.3em] text-[10px] uppercase">
      Initializing Secure Classroom
    </p>
  </div>
);

export default LoadingScreen;
