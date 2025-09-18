import AppLayout from "@/components/layout/AppLayout";

export default function Placeholder({ title }: { title: string }) {
  return (
    <AppLayout>
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center max-w-xl">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">
            This section is scaffolded. Tell the assistant what data and UI you want here, and we'll build it next.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
