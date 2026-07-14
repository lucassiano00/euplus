import { useRegisterSW } from 'virtual:pwa-register/react'

// Aparece só quando o service worker baixou uma versão nova.
// updateServiceWorker(true) faz skipWaiting e recarrega a página já no build novo —
// é o que evita o usuário ficar preso na versão antiga do PWA depois de um deploy.
export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-surface-container-high px-4 py-3 shadow-2xl shadow-black/40 sm:left-auto sm:right-6 sm:mx-0"
    >
      <p className="flex-1 text-sm text-on-surface">Nova versão disponível.</p>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="shrink-0 rounded-xl bg-secondary-container px-4 py-2 text-sm font-bold text-on-secondary transition hover:brightness-110"
      >
        Atualizar
      </button>
    </div>
  )
}
