import React from "react";

export default function Loading({ text }: { text: string }) {
  return (
    <div>
      <div className="relative flex flex-col shadow-lg animate-pulse p-6">
        {/* centra o container de 6xl */}
        <div className="mx-auto w-full max-w-6xl">
          {/* centra os itens na cross-axis e dá gaps */}
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {text}
            </h2>
            {/* barras com larguras menores para parecerem centradas */}
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
