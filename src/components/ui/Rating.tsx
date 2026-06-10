function Rating({ value }: { value: number }) {
    return (
        <div className="flex items-center">
            {Array.from({ length: 5 }, (_, index) => {
                const fill = Math.max(0, Math.min(1, value - index)); // 0..1 how much of this star is filled
                const clipId = `star-clip-${index}-${Math.floor(value * 100)}`;

                return (
                    <svg
                        key={index}
                        className="w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        aria-hidden
                    >
                        <defs>
                            <clipPath id={clipId}>
                                {/* viewBox is 20x20, so set rect width in user units */}
                                <rect x="0" y="0" width={fill * 20} height="20" />
                            </clipPath>
                        </defs>

                        {/* empty star */}
                        <path
                            d="M10 15l-5.878 3.09 1.121-6.535L1 6.545l6.545-.954L10 0l2.455 5.591L19 6.545l-4.243 4.005 1.121 6.535z"
                            fill="currentColor"
                            className="text-gray-400"
                        />

                        {/* filled portion, clipped to the fraction */}
                        {fill > 0 && (
                            <g clipPath={`url(#${clipId})`}>
                                <path
                                    d="M10 15l-5.878 3.09 1.121-6.535L1 6.545l6.545-.954L10 0l2.455 5.591L19 6.545l-4.243 4.005 1.121 6.535z"
                                    fill="currentColor"
                                    className="text-yellow-500"
                                />
                            </g>
                        )}
                    </svg>
                );
            })}
        </div>
    );
}

export default Rating;