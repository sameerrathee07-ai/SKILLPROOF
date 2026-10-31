import { NotFound } from "@/components/ui/error-404-page";

export default function NotFoundPage() {
  return (
    <div className="fixed inset-0 z-50">
      <NotFound />
    </div>
  );
}
