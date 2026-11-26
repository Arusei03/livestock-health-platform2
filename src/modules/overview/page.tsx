import { useState } from "react";
import AddAnimal from "../animals/addanimalsform";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadAnimalImage } from "../../packages/s3";
import { userAxios } from "../../packages/axioxinstance";
import { fetchAuthSession } from "aws-amplify/auth";
import AnimalListing from "../animals/animal-listing";

export interface AnimalFormData {
  tagNumber: string;
  name: string;
  species: string;
  breed: string;
  sex: string;
  dateOfBirth: string;
  ageIsEstimated: boolean;
  image: File | null;
  imageKey?: string | null;
  notes: string;
}
const Overview = () => {
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const queryClient = useQueryClient();


 const handleAddAnimal = async (data: AnimalFormData) => {
    try {
      setIsSaving(true);

      // 1. Upload image if one was selected
      let imageKey: string | null = null;

      if (data.image) {
        imageKey = await uploadAnimalImage(data.image);
      }

      // 2. Prepare the backend payload
      const payload = {
        tagNumber: data.tagNumber.trim(),
        name: data.name.trim() || null,
        species: data.species.trim(),
        breed: data.breed.trim() || null,
        sex: data.sex || null,
        dateOfBirth: data.dateOfBirth || null,
        ageIsEstimated: data.ageIsEstimated,
        imageKey,
        notes: data.notes.trim() || null,
      };

     const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString();

        if (!accessToken) {
        throw new Error("Your session has expired. Please sign in again.");
        }

        await userAxios.post("/api/reg-animal", payload, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
});
      // 4. Refresh animal data
      await queryClient.invalidateQueries({
        queryKey: ["animals"],
      });

      // 5. Close form and notify user
      setShowAddAnimal(false);
      toast.success("Animal registered successfully!");

    } catch (error) {
      console.error("Animal registration failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not register this animal. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getAnimals = async () => {
  const session = await fetchAuthSession();
  const accessToken = session.tokens?.accessToken?.toString();

  if (!accessToken) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await userAxios.get("/api/get-animals", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data.animals;
};

const { data: animals = [], isLoading: isAnimalsLoading } = useQuery({
  queryKey: ["animals"],
  queryFn: getAnimals,
});


  if (showAddAnimal) {
    return (
      <AddAnimal
        onCancel={() => setShowAddAnimal(false)}
        onSubmit={handleAddAnimal}
        isSaving={isSaving}
      />
    );
  }

   return (
    <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Your livestock
            </h1>

            <p className="mt-1 text-sm text-foreground/60">
              Manage your animals and their health information.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddAnimal(true)}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
          >
            + Add animal
          </button>
        </div>

        <AnimalListing animals={animals} />
      </div>
    </main>
  );
};


export default Overview;