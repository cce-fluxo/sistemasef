"use client";

export function ConfirmSubmitButton({
  mensagem,
  children,
}: {
  mensagem: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(mensagem)) e.preventDefault();
      }}
      className="text-sm font-medium text-red-500 hover:underline"
    >
      {children}
    </button>
  );
}
