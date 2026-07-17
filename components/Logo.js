import Image from "next/image";

export default function Logo({ tamanho = 96, comNome = false, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo.png"
        alt="Dom Wagão Barbearia"
        width={tamanho}
        height={tamanho}
        priority
        className="rounded-full"
        style={{ width: tamanho, height: tamanho }}
      />
      {comNome && (
        <div className="leading-tight">
          <p className="font-[family-name:var(--font-display)] text-lg font-bold texto-ouro">
            Dom Wagão
          </p>
          <p className="text-xs tracking-[0.3em] text-nevoa uppercase">
            Barbearia
          </p>
        </div>
      )}
    </div>
  );
}
