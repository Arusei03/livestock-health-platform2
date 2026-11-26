import { useState } from "react";

interface Animal {
  id: string;
  tagNumber: string;
  name: string | null;
  species: string;
  breed: string | null;
  sex: string | null;
  dateOfBirth: string | null;
  ageIsEstimated: boolean;
  imageKey: string | null;
  notes: string | null;
  createdAt: string;
}

interface AnimalListingProps {
  animals: Animal[];
}

const calculateAge = (dateOfBirth: string | null) => {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0) {
    return `${years} year${years === 1 ? "" : "s"}${months > 0 ? `, ${months} months` : ""}`;
  }

  return `${months} month${months === 1 ? "" : "s"}`;
};

const AnimalListing = ({ animals }: AnimalListingProps) => {
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  return (
    <div>
      {animals.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-muted/40 p-6 text-center text-sm text-foreground/70">
          No animals yet. Add your first animal to get started.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {animals.map((animal) => (
            <li key={animal.id}>
              <button
                type="button"
                onClick={() => setSelectedAnimal(animal)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl bg-background p-4 text-left shadow-sm ring-1 ring-black/5 transition hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-base font-bold">
                      {animal.name || animal.tagNumber}
                    </p>

                    <span className="shrink-0 text-xs font-medium text-foreground/50">
                      {animal.tagNumber}
                    </span>
                  </div>

                  <p className="mt-0.5 text-sm text-foreground/65">
                    {[animal.breed, animal.species, calculateAge(animal.dateOfBirth)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                <span className="shrink-0 text-lg font-medium text-foreground/40">
                  ›
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Animal Profile Modal */}
      {selectedAnimal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close animal profile"
            onClick={() => setSelectedAnimal(null)}
            className="absolute inset-0 h-full w-full cursor-default"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedAnimal.tagNumber} profile`}
            className="relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-6 shadow-2xl sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {selectedAnimal.name || selectedAnimal.tagNumber}
                </h2>

                <p className="mt-0.5 text-sm text-foreground/65">
                  {selectedAnimal.tagNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAnimal(null)}
                aria-label="Close profile"
                className="rounded-full bg-muted px-3 py-1 text-base font-medium hover:opacity-80"
              >
                ×
              </button>
            </div>

            {/* Quick Details */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {selectedAnimal.species}
              </span>

              {selectedAnimal.breed && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {selectedAnimal.breed}
                </span>
              )}

              {selectedAnimal.sex && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {selectedAnimal.sex}
                </span>
              )}
            </div>

            {/* Animal Information */}
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/55">
                Animal information
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-muted/40 p-4 text-sm">
                <div>
                  <p className="text-xs text-foreground/55">Animal ID</p>
                  <p className="mt-1 font-semibold">
                    {selectedAnimal.tagNumber}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-foreground/55">Name</p>
                  <p className="mt-1 font-semibold">
                    {selectedAnimal.name || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-foreground/55">Species</p>
                  <p className="mt-1 font-semibold">
                    {selectedAnimal.species}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-foreground/55">Breed</p>
                  <p className="mt-1 font-semibold">
                    {selectedAnimal.breed || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-foreground/55">Sex</p>
                  <p className="mt-1 font-semibold">
                    {selectedAnimal.sex || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-foreground/55">Age</p>
                  <p className="mt-1 font-semibold">
                    {calculateAge(selectedAnimal.dateOfBirth) || "Not recorded"}
                  </p>

                  {selectedAnimal.ageIsEstimated && (
                    <p className="mt-0.5 text-xs text-foreground/50">
                      Estimated
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <p className="text-xs text-foreground/55">Date of birth</p>
                  <p className="mt-1 font-semibold">
                    {selectedAnimal.dateOfBirth
                      ? new Date(selectedAnimal.dateOfBirth).toLocaleDateString()
                      : "Not recorded"}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/55">
                Notes
              </h3>

              <div className="mt-2 rounded-2xl bg-muted/40 p-4 text-sm text-foreground/75">
                {selectedAnimal.notes || "No notes added for this animal."}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setSelectedAnimal(null)}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Close profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalListing;