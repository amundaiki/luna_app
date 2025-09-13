import { AddLeadForm } from "@/src/components/forms/add-lead-form";

export default function AddLeadPage() {
  return (
    <div className="py-4 space-y-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="heading-md mb-6">Registrer nytt lead</h1>
        <AddLeadForm />
      </div>
    </div>
  );
}
