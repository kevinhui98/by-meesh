import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import Layout from "@/components/Layout";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetDish,
  useCreateDish,
  useUpdateDish,
  getGetDishesQueryKey,
  getGetDishQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, TrendingUp, Upload, X, Image as ImageIcon } from "lucide-react";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";

const ingredientSchema = z.object({
  name: z.string().min(1, "Required"),
  quantity: z.string().min(1, "Required"),
  unit: z.string().min(1, "Required"),
  unitCost: z.coerce.number().min(0, "Must be >= 0"),
});

const supplySchema = z.object({
  name: z.string().min(1, "Required"),
  quantity: z.string().min(1, "Required"),
  unitCost: z.coerce.number().min(0, "Must be >= 0"),
});

const schema = z.object({
  name: z.string().min(1, "Dish name is required"),
  description: z.string().optional(),
  recipe: z.string().optional(),
  prep: z.string().optional(),
  service: z.string().optional(),
  flatware: z.string().optional(),
  category: z.string().optional(),
  targetGp: z.coerce.number().min(0).max(100).optional(),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  ingredients: z.array(ingredientSchema),
  supplies: z.array(supplySchema),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = ["appetizer", "main", "side", "dessert", "beverage", "other"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

const INPUT_CLASS = "w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";
const TEXTAREA_CLASS = `${INPUT_CLASS} resize-none`;

function ImageUploader({
  control,
  setValue,
}: {
  control: ReturnType<typeof useForm<FormData>>["control"];
  setValue: ReturnType<typeof useForm<FormData>>["setValue"];
}) {
  const url = useWatch({ control, name: "imageUrl" });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `dishes/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      setValue("imageUrl", downloadUrl, { shouldDirty: true });
    } catch (err) {
      const code = (err as { code?: string })?.code;
      const message = (err as Error)?.message;
      console.error("Image upload failed", err);
      if (code === "storage/unauthorized") {
        toast.error("Upload blocked by Storage rules. Update rules in Firebase Console.");
      } else {
        toast.error(`Upload failed: ${code ?? message ?? "unknown error"}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!url) return;
    setValue("imageUrl", "", { shouldDirty: true });
    // best-effort: delete from storage if it's a firebase storage URL
    try {
      if (url.includes("firebasestorage.googleapis.com")) {
        const fileRef = storageRef(storage, decodeURIComponent(url.split("/o/")[1].split("?")[0]));
        await deleteObject(fileRef);
      }
    } catch {
      // ignore — form field is cleared regardless
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (url) {
    return (
      <div className="relative inline-block">
        <img src={url} alt="Dish" className="h-40 w-auto rounded-lg border border-border object-cover" />
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove image"
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      aria-disabled={uploading}
      className={`w-full border-2 border-dashed rounded-xl py-10 px-6 flex flex-col items-center justify-center gap-2 transition-colors
        ${dragOver ? "border-primary bg-primary/5" : "border-border"}
        ${uploading ? "opacity-60 cursor-wait" : ""}`}
    >
      {uploading ? (
        <>
          <Upload className="w-6 h-6 text-muted-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </>
      ) : (
        <>
          <ImageIcon className="w-6 h-6 text-muted-foreground" />
          <p className="text-sm text-foreground">
            <span className="text-primary font-medium">Drag and drop</span> an image
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
        </>
      )}
    </div>
  );
}

function PricingPanel({
  control,
  register,
}: {
  control: ReturnType<typeof useForm<FormData>>["control"];
  register: ReturnType<typeof useForm<FormData>>["register"];
}) {
  const ingredients = useWatch({ control, name: "ingredients" }) ?? [];
  const supplies = useWatch({ control, name: "supplies" }) ?? [];
  const targetGp = useWatch({ control, name: "targetGp" });

  const ingCost = ingredients.reduce((s, i) => s + (Number(i?.unitCost) || 0), 0);
  const supCost = supplies.reduce((s, i) => s + (Number(i?.unitCost) || 0), 0);
  const totalCost = ingCost + supCost;
  const gp = Math.min(Math.max(Number(targetGp) || 0, 0), 99.9);
  const suggestedPrice = gp > 0 ? totalCost / (1 - gp / 100) : null;

  const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div className={`flex items-center justify-between py-2 ${highlight ? "border-t border-border mt-1 pt-3" : ""}`}>
      <span className={`text-sm ${highlight ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-primary text-base" : "text-foreground"}`}>{value}</span>
    </div>
  );

  return (
    <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Cost & Pricing</h2>
      </div>
      <div className="p-5">
        <Row label="Ingredient cost" value={`$${ingCost.toFixed(2)}`} />
        <Row label="Supply cost" value={`$${supCost.toFixed(2)}`} />
        <Row label="Total estimated cost" value={`$${totalCost.toFixed(2)}`} highlight />

        <div className="mt-4 pt-4 border-t border-border">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Target gross profit %
          </label>
          <div className="relative">
            <input
              {...register("targetGp")}
              type="number"
              step="1"
              min="0"
              max="99"
              placeholder="e.g. 65"
              className={INPUT_CLASS + " pr-8"}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
          </div>
          {suggestedPrice !== null && (
            <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-xs text-muted-foreground mb-0.5">Suggested sell price</p>
              <p className="text-xl font-bold text-primary">${suggestedPrice.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                at {gp}% GP · ${(suggestedPrice - totalCost).toFixed(2)} profit
              </p>
            </div>
          )}
          {!suggestedPrice && totalCost > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">Enter a target GP % to see the suggested sell price.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DishDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isNew = id === "new";
  const dishId = isNew ? 0 : parseInt(id);
  const qc = useQueryClient();

  const { data: dish } = useGetDish(dishId, {
    query: { enabled: !isNew, queryKey: getGetDishQueryKey(dishId) },
  });

  const createDish = useCreateDish();
  const updateDish = useUpdateDish();

  const { register, control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ingredients: [], supplies: [], targetGp: undefined, imageUrl: "" },
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({ control, name: "ingredients" });
  const { fields: supplyFields, append: appendSupply, remove: removeSupply } = useFieldArray({ control, name: "supplies" });

  useEffect(() => {
    if (dish && !isNew) {
      reset({
        name: dish.name,
        description: dish.description ?? "",
        recipe: dish.recipe ?? "",
        prep: dish.prep ?? "",
        service: dish.service ?? "",
        flatware: dish.flatware ?? "",
        category: dish.category ?? "",
        targetGp: dish.targetGp ?? undefined,
        imageUrl: dish.imageUrl ?? "",
        ingredients: dish.ingredients ?? [],
        supplies: dish.supplies ?? [],
      });
    }
  }, [dish, isNew, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        recipe: data.recipe || null,
        prep: data.prep || null,
        service: data.service || null,
        flatware: data.flatware || null,
        category: data.category || null,
        targetGp: data.targetGp ?? null,
        imageUrl: data.imageUrl || null,
        ingredients: data.ingredients,
        supplies: data.supplies,
      };

      if (isNew) {
        await createDish.mutateAsync({ data: payload });
      } else {
        await updateDish.mutateAsync({ id: dishId, data: payload });
        qc.invalidateQueries({ queryKey: getGetDishQueryKey(dishId) });
      }
      qc.invalidateQueries({ queryKey: getGetDishesQueryKey() });
      toast.success(isNew ? "Dish created" : "Dish updated");
      navigate("/dishes");
    } catch {
      toast.error("Failed to save dish");
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dishes">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">
            {isNew ? "New Dish" : "Edit Dish"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main form — 2/3 width */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-5">
            {/* Basic info */}
            <Section title="Basic Information">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Dish name *" error={errors.name?.message}>
                    <input {...register("name")} placeholder="Seared Duck Breast" className={INPUT_CLASS} />
                  </Field>
                  <Field label="Category">
                    <select {...register("category")} className={INPUT_CLASS}>
                      <option value="">Select category...</option>
                      {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Description">
                  <textarea {...register("description")} rows={2} placeholder="Brief description of the dish..." className={TEXTAREA_CLASS} />
                </Field>
              </div>
            </Section>

            {/* Image */}
            <Section title="Image">
              <ImageUploader control={control} setValue={setValue} />
            </Section>

            {/* Detailed notes */}
            <Section title="Preparation Details">
              <div className="space-y-4">
                <Field label="Recipe notes">
                  <textarea {...register("recipe")} rows={3} placeholder="Key recipe steps, temperatures, techniques..." className={TEXTAREA_CLASS} />
                </Field>
                <Field label="Prep instructions">
                  <textarea {...register("prep")} rows={3} placeholder="Day-of prep timeline, mise en place notes..." className={TEXTAREA_CLASS} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Service notes">
                    <textarea {...register("service")} rows={2} placeholder="Plating, temperature, timing..." className={TEXTAREA_CLASS} />
                  </Field>
                  <Field label="Flatware & utensils">
                    <textarea {...register("flatware")} rows={2} placeholder="Dinner fork, steak knife, soup spoon..." className={TEXTAREA_CLASS} />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Ingredients */}
            <Section title="Ingredients">
              <div className="space-y-2 mb-3">
                {ingredientFields.length > 0 && (
                  <div className="grid grid-cols-12 gap-2 px-1 mb-1">
                    <div className="col-span-4 text-xs font-medium text-muted-foreground">Name</div>
                    <div className="col-span-2 text-xs font-medium text-muted-foreground">Qty</div>
                    <div className="col-span-2 text-xs font-medium text-muted-foreground">Unit</div>
                    <div className="col-span-3 text-xs font-medium text-muted-foreground">Unit cost ($)</div>
                  </div>
                )}
                {ingredientFields.map((field, i) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-4">
                      <input {...register(`ingredients.${i}.name`)} placeholder="Ingredient" className={INPUT_CLASS} />
                      {errors.ingredients?.[i]?.name && <p className="text-xs text-destructive mt-1">{errors.ingredients[i]?.name?.message}</p>}
                    </div>
                    <div className="col-span-2">
                      <input {...register(`ingredients.${i}.quantity`)} placeholder="2" className={INPUT_CLASS} />
                    </div>
                    <div className="col-span-2">
                      <input {...register(`ingredients.${i}.unit`)} placeholder="lbs" className={INPUT_CLASS} />
                    </div>
                    <div className="col-span-3">
                      <input {...register(`ingredients.${i}.unitCost`)} type="number" step="0.01" placeholder="0.00" className={INPUT_CLASS} />
                    </div>
                    <div className="col-span-1 flex justify-center pt-2">
                      <button type="button" onClick={() => removeIngredient(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => appendIngredient({ name: "", quantity: "", unit: "", unitCost: 0 })}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Plus className="w-4 h-4" /> Add ingredient
              </button>
            </Section>

            {/* Supplies */}
            <Section title="Supplies & Equipment">
              <div className="space-y-2 mb-3">
                {supplyFields.length > 0 && (
                  <div className="grid grid-cols-12 gap-2 px-1 mb-1">
                    <div className="col-span-5 text-xs font-medium text-muted-foreground">Name</div>
                    <div className="col-span-3 text-xs font-medium text-muted-foreground">Quantity</div>
                    <div className="col-span-3 text-xs font-medium text-muted-foreground">Unit cost ($)</div>
                  </div>
                )}
                {supplyFields.map((field, i) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-5">
                      <input {...register(`supplies.${i}.name`)} placeholder="Supply/equipment" className={INPUT_CLASS} />
                      {errors.supplies?.[i]?.name && <p className="text-xs text-destructive mt-1">{errors.supplies[i]?.name?.message}</p>}
                    </div>
                    <div className="col-span-3">
                      <input {...register(`supplies.${i}.quantity`)} placeholder="1" className={INPUT_CLASS} />
                    </div>
                    <div className="col-span-3">
                      <input {...register(`supplies.${i}.unitCost`)} type="number" step="0.01" placeholder="0.00" className={INPUT_CLASS} />
                    </div>
                    <div className="col-span-1 flex justify-center pt-2">
                      <button type="button" onClick={() => removeSupply(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => appendSupply({ name: "", quantity: "", unitCost: 0 })}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Plus className="w-4 h-4" /> Add supply
              </button>
            </Section>

            <div className="flex gap-3 pt-2">
              <Link href="/dishes" className="flex-1">
                <button type="button" className="w-full py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : (isNew ? "Create Dish" : "Save Changes")}
              </button>
            </div>
          </form>

          {/* Pricing sidebar — 1/3 width */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <PricingPanel control={control} register={register} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
