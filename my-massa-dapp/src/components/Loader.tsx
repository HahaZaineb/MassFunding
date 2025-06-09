"use client"

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00ff9d]"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}
