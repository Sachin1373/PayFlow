export function StepIndicator({ step }: { step: number }) {
  const steps = ["Customer", "Line Items", "Review"];
  return (
    <div className="flex items-center w-full">
      {steps.map((label, i) => {
        const idx = i + 1;
        const active = idx === step;
        const done = idx < step;
        return (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border ${
                  done
                    ? "bg-primary border-primary text-primary-foreground"
                    : active
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground"
                }`}
              >
                {idx}
              </div>
              <span
                className={`text-sm font-medium ${active ? "text-foreground" : done ? "text-primary" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-4 ${done ? "bg-primary/40" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
