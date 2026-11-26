
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { uploadAnimalImage } from "../../packages/s3";
import { AnimalFormData } from "../overview/page";



interface AddAnimalProps {
animal?: AnimalFormData & { id: string };
  onCancel: () => void;
  onSubmit: (data: AnimalFormData) => void | Promise<void>;
  isSaving?: boolean;
}

const initialForm: AnimalFormData = {
  tagNumber: "",
  name: "",
  species: "",
  breed: "",
  sex: "",
  dateOfBirth: "",
  ageIsEstimated: false,
  image: null,
  imageKey: null,
  notes: "",
};

const AddAnimal = ({
animal,
  onCancel,
  onSubmit,
  isSaving = false,
}: AddAnimalProps) => {
const [form, setForm] = useState<AnimalFormData>( animal ?? initialForm);
 

  const updateField = <K extends keyof AnimalFormData>(
    field: K,
    value: AnimalFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!form.tagNumber.trim() || !form.species.trim()) {
    toast.error("Animal ID and species are required.");
    return;
  }

  if (form.dateOfBirth) {
    const dob = new Date(`${form.dateOfBirth}T00:00:00`);

    if (Number.isNaN(dob.getTime())) {
      toast.error("Please enter a valid date of birth.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dob > today) {
      toast.error("Date of birth cannot be in the future.");
      return;
    }
  }

  await onSubmit(form);
};

const isFormInvalid =
  !form.tagNumber.trim() ||
  !form.species.trim() ||
  (form.dateOfBirth !== "" &&
    (
      Number.isNaN(new Date(`${form.dateOfBirth}T00:00:00`).getTime()) ||
      new Date(`${form.dateOfBirth}T00:00:00`) > new Date(new Date().setHours(0, 0, 0, 0))
    )
  ) ||
  (form.ageIsEstimated && !form.dateOfBirth);


  const inputClass =
    "mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/10";

  const labelClass = "block text-sm font-medium text-foreground";

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
      <div className="mb-6">
        <h2>
        {animal ? "Edit animal" : "Add an animal"}
        </h2>
        <p className="mt-1 text-sm text-foreground/60">
          Enter the animal's details to add it to your livestock.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic information */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-primary">
            Basic information
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">

              <label className={labelClass}>
             Tag Number*
              <input
                value={form.tagNumber}
                onChange={(e) => updateField("tagNumber", e.target.value)}
                placeholder="e.g. COW-001"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Name
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Daisy"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Species *
              <select
                required
                value={form.species}
                onChange={(e) => updateField("species", e.target.value)}
                className={inputClass}
              >
                <option value="">Select species</option>
                <option value="Cattle">Cattle</option>
                <option value="Goat">Goat</option>
                <option value="Sheep">Sheep</option>
                <option value="Pig">Pig</option>
                <option value="Poultry">Poultry</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className={labelClass}>
              Breed
              <input
                value={form.breed}
                onChange={(e) => updateField("breed", e.target.value)}
                placeholder="e.g. Friesian"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Sex
              <select
                value={form.sex}
                onChange={(e) => updateField("sex", e.target.value)}
                className={inputClass}
              >
                <option value="">Select sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Age information */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-primary">
            Age information
          </h3>

          <label className={labelClass}>
            Date of birth
            <input
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={form.dateOfBirth}
              onChange={(e) => updateField("dateOfBirth", e.target.value)}
              className={inputClass}
            />
          </label>

          {form.dateOfBirth && (
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-foreground/75">
              <input
                type="checkbox"
                checked={form.ageIsEstimated}
                onChange={(e) =>
                  updateField("ageIsEstimated", e.target.checked)
                }
                className="h-4 w-4 accent-primary"
              />
              This is an estimated date of birth
            </label>
          )}
        </div>

        <div className="border-t border-border" />

        {/* Image */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-primary">
            Animal image
          </h3>

          <label className={labelClass}>
            Upload an image
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                updateField("image", e.target.files?.[0] ?? null)
              }
              className="mt-1.5 block w-full cursor-pointer rounded-xl border border-dashed border-border bg-background px-3 py-4 text-sm text-foreground/70 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:opacity-90"
            />
          </label>

          {form.image && (
            <p className="mt-2 text-xs text-foreground/60">
              Selected: {form.image.name}
            </p>
          )}
        </div>

        <div className="border-t border-border" />

        {/* Notes */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-primary">
            Additional information
          </h3>

          <label className={labelClass}>
            Notes
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Add any additional details about this animal..."
              className={`${inputClass} resize-none`}
            />
          </label>
        </div>

      

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-background disabled:opacity-50"
          >
            Cancel
          </button>

         <button
        type="submit"
        disabled={isSaving || isFormInvalid}
        className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
        {isSaving ? "Saving..." : animal ? "Save changes" : "Add animal"}
        </button>
        </div>
      </form>
    </div>
  );
};

export default AddAnimal;
