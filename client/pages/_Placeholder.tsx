import { BarChart3 } from "lucide-react";

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="grid place-items-center py-20">
      <div className="text-center max-w-xl">
        <div className="mx-auto mb-6 h-14 w-14 rounded-xl bg-accent grid place-content-center text-primary">
          <BarChart3 className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">
          This section is ready to be tailored. Tell me what to include and I'll build it next.
        </p>
      </div>
    </div>
  );
}
