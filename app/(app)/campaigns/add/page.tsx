import { AddCampaignForm } from "@/src/components/forms/add-campaign-form";

export default function AddCampaignPage() {
  return (
    <div className="py-4 space-y-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="heading-md mb-6">Opprett ny kampanje</h1>
        <AddCampaignForm />
      </div>
    </div>
  );
}
