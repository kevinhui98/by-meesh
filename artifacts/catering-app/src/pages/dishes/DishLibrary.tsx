import { useState } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import {
  useGetDishes,
  useDeleteDish,
  getGetDishesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ChefHat,
  DollarSign,
} from "lucide-react";

const CATEGORIES = ["All", "appetizer", "main", "side", "dessert", "beverage", "other"];

export default function DishLibrary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const qc = useQueryClient();

  const { data: dishes, isLoading } = useGetDishes({
    query: { queryKey: getGetDishesQueryKey() },
  });
  const deleteDish = useDeleteDish();

  const filtered = (dishes ?? []).filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || d.category === category;
    return matchSearch && matchCategory;
  });

  const handleDelete = async (id: number) => {
    try {
      await deleteDish.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getGetDishesQueryKey() });
      toast.success("Dish deleted");
    } catch {
      toast.error("Failed to delete dish");
    } finally {
      setConfirmDelete(null);
    }
  };

  const getDishCost = (dish: any) => {
    let cost = 0;
    for (const ing of dish.ingredients ?? []) cost += (ing.unitCost ?? 0);
    for (const sup of dish.supplies ?? []) cost += (sup.unitCost ?? 0);
    return cost;
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dish Library</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} dish{filtered.length !== 1 ? "es" : ""}
            </p>
          </div>
          <Link href="/dishes/new">
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Add Dish
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize
                  ${category === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-card-border rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <ChefHat className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium text-foreground mb-1">No dishes found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {search || category !== "All" ? "Try adjusting your filters." : "Start building your dish library."}
            </p>
            {!search && category === "All" && (
              <Link href="/dishes/new">
                <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90">
                  Add First Dish
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((dish) => (
              <div key={dish.id} className="group bg-card border border-card-border rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
                <div className="h-28 bg-gradient-to-br from-accent/30 to-primary/5 flex items-center justify-center">
                  <ChefHat className="w-10 h-10 text-primary/20" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 mr-2">
                      {dish.category && (
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">{dish.category}</span>
                      )}
                      <h3 className="font-semibold text-foreground text-sm mt-0.5">{dish.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Link href={`/dishes/${dish.id}`}>
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => setConfirmDelete(dish.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {dish.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{dish.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      {(dish.ingredients ?? []).length} ingredients
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                      <DollarSign className="w-3 h-3 text-primary" />
                      {getDishCost(dish).toFixed(2)} base
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="font-semibold text-foreground mb-2">Delete this dish?</h2>
            <p className="text-sm text-muted-foreground mb-5">This will remove it from all menus. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
