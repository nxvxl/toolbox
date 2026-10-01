import { useEffect, useState } from 'react'
import Button from './Button'
import Panel from './Panel'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent
  }
}

const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true

const isIos = (): boolean => /iphone|ipad|ipod/i.test(window.navigator.userAgent)

const isChromium = (): boolean =>
  !isIos() && /chrome|chromium|crios|edg/i.test(window.navigator.userAgent)

export default function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const sync = () => {
      if (window.__pwaInstallPrompt) setDeferred(window.__pwaInstallPrompt)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
      window.__pwaInstallPrompt = undefined
    }
    sync()
    window.addEventListener('pwa:installprompt', sync)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('pwa:installprompt', sync)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || isStandalone()) return null

  const ios = isIos()
  if (!ios && !isChromium()) return null

  const install = async () => {
    if (deferred) {
      await deferred.prompt()
      const choice = await deferred.userChoice
      if (choice.outcome === 'accepted') setInstalled(true)
      setDeferred(null)
      window.__pwaInstallPrompt = undefined
      return
    }
    setShowHelp((value) => !value)
  }

  return (
    <div className="relative">
      <Button size="sm" onClick={install}>
        Install app
      </Button>
      {showHelp && (
        <Panel className="absolute right-0 top-full z-50 mt-2 w-64 p-3 text-xs text-slate-400">
          {ios ? (
            <>
              To install on iOS, tap the Share button, then choose{' '}
              <span className="font-semibold">Add to Home Screen</span>.
            </>
          ) : (
            <>
              Open your browser menu and choose{' '}
              <span className="font-semibold">Install Toolbox</span> (or click
              the install icon in the address bar).
            </>
          )}
        </Panel>
      )}
    </div>
  )
}
