import Logo from "./Logo";

export default function TelaCarregando() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="pulso rounded-full">
        <Logo tamanho={88} />
      </div>
      <p className="text-nevoa text-sm animate-pulse">Carregando...</p>
    </div>
  );
}
