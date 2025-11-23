import React from "react";

type AnaliticsPair = [string, string | number];
type AnaliticsScalar = number | string;
type AnaliticsValue = AnaliticsScalar | AnaliticsPair | AnaliticsPair[];

interface AnaliticsItem {
  name: string;
  data: AnaliticsValue;
}

interface AnaliticsProps {
  data: AnaliticsItem;
}

const nf = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2, // 0.2857 -> 0.29
});

function formatValue(v: string | number) {
  return typeof v === "number" ? nf.format(v) : v || "—";
}

export default function Analitics({ data }: AnaliticsProps) {
  const { name, data: values } = data;

  const isScalar = (v: unknown): v is AnaliticsScalar =>
    typeof v === "number" || typeof v === "string";

  const asPairs = (v: AnaliticsValue): AnaliticsPair[] | null => {
    if (Array.isArray(v)) {
      // único par: ["Corte Masculino", 1]
      const looksLikeSinglePair =
        v.length === 2 &&
        typeof v[0] === "string" &&
        (typeof v[1] === "string" || typeof v[1] === "number");

      if (looksLikeSinglePair) return [v as AnaliticsPair];

      // lista de pares: [ ["Corte", 10], ["Barba", 5] ]
      if (v.length > 0 && Array.isArray(v[0])) return v as AnaliticsPair[];

      // array vazio -> lista vazia
      if (v.length === 0) return [];
    }
    return null;
  };

  const pairs = asPairs(values);

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-md h-full flex flex-col justify-between min-h-[120px]">
      <h2 className="text-lg font-semibold mb-3">{name}</h2>
      {isScalar(values) ? (
        <p className="text-2xl font-extrabold text-gold tabular-nums">
          {formatValue(values)}
        </p>
      ) : pairs ? (
        pairs.length ? (
          <ul className="mt-2">
            {pairs.map(([label, value], index) => (
              <li
                key={index}
                className="flex justify-between py-2 border-b last:border-b-0"
              >
                <span className="text-sm text-zinc-500">{label}</span>
                <span className="font-medium tabular-nums">
                  {formatValue(value)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">Sem dados.</p>
        )
      ) : (
        <pre className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
          {JSON.stringify(values, null, 2)}
        </pre>
      )}
    </div>
  );
}
