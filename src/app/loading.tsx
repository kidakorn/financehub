export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center anim-fade">
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer pulsing ring */}
        <div className="absolute w-24 h-24 rounded-full border-4 border-blue-100 animate-ping opacity-75"></div>
        
        {/* Inner spinning ring */}
        <div className="absolute w-20 h-20 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-400 animate-spin"></div>
        
        {/* Center Logo Icon */}
        <div className="w-12 h-12 text-blue-600 bg-white rounded-full flex items-center justify-center shadow-sm relative z-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center anim-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Financial Hub</h2>
        <div className="flex items-center gap-1 mt-2 text-blue-600">
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
}
