export default function MapPlaceholder() {
    return (
        <div className="w-full h-full min-h-[400px] bg-slate-200 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-400">
            <div className="text-center p-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 mx-auto text-slate-500 mb-2"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0Z"
                    />
                </svg>
                <p className="text-slate-600 font-medium">Map View</p>
                <p className="text-sm text-slate-500">Google Maps placeholder (To be integrated)</p>
            </div>
        </div>
    )
}
