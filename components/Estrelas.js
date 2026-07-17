"use client";

export default function Estrelas({ nota = 0, tamanho = 18, onSelecionar }) {
  const interativo = typeof onSelecionar === "function";
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interativo}
          onClick={() => interativo && onSelecionar(i)}
          className={interativo ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
          aria-label={`${i} estrela${i > 1 ? "s" : ""}`}
        >
          <svg
            width={tamanho}
            height={tamanho}
            viewBox="0 0 24 24"
            fill={i <= nota ? "#d4af37" : "none"}
            stroke={i <= nota ? "#d4af37" : "#4a4a52"}
            strokeWidth="1.5"
          >
            <path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.3l1.4-6.8L2.2 9.8l6.9-.7z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
