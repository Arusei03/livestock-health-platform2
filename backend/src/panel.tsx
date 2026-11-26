import { Bell, X } from "lucide-react";


type Props = {
  alerts: any [];
  onClose: () => void;
  onOpenAlert: (alert: any) => void;
};

const NotificationsPanel = ({ alerts, onClose, onOpenAlert }: Props) => (
  <>
    {/* Invisible backdrop: the page behind stays visible, and clicking it closes the panel (like YouTube). */}
    <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />

    <section
      role="dialog"
      aria-label="Notifications"
      className="fixed right-4 top-16 z-50 flex max-h-[80vh] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl"
    >
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-lg font-bold">Notifications</h2>
        <button
          onClick={onClose}
          aria-label="Close notifications"
          className="rounded-full p-2 hover:bg-foreground/10"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <Bell className="h-16 w-16 text-foreground/30" />
          <p className="mt-2 font-semibold">Your notifications live here</p>
          <p className="text-sm text-foreground/70">
            Health alerts and vaccination reminders for your animals will show up here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-y-auto">
          {alerts.map((alert) => (
            <li key={alert.key}>
              <button
                onClick={() => onOpenAlert(alert)}
                className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-foreground/5"
              >
                <span
                  className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${
                    alert.level === "high" ? "bg-red-600" : "bg-amber-500"
                  }`}
                  aria-hidden="true"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold uppercase text-foreground/60">
                    {alert.level === "high" ? "High risk" : alert.kind === "vaccination" ? "Vaccination" : "Under observation"}
                  </span>
                  <span className="font-semibold">{alert.title}</span>
                  <span className="text-sm text-foreground/70">{alert.detail}</span>
                  <span className="text-xs text-foreground/50">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  </>
);

export default NotificationsPanel;