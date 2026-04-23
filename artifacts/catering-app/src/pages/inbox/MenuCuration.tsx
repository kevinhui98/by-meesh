import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import Layout from "@/components/Layout";
import {
  useGetEvent,
  useGetDishes,
  useGetEventMenu,
  useSetEventMenu,
  getGetEventMenuQueryKey,
  getGetDishesQueryKey,
  getGetEventQueryKey,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, GripVertical, Plus, X, Save, ChefHat } from "lucide-react";

const COURSES = ["Appetizer", "Main", "Side", "Dessert", "Beverage"] as const;
type Course = typeof COURSES[number];

interface MenuDish {
  id: string; // unique instance id
  dishId: number;
  name: string;
  category?: string | null;
  course: Course;
  sortOrder: number;
}

function DishCard({ dish, onRemove }: { dish: MenuDish; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dish.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-2 bg-card border border-card-border rounded-lg px-3 py-2.5 group">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground shrink-0">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{dish.name}</div>
        {dish.category && <div className="text-xs text-muted-foreground capitalize">{dish.category}</div>}
      </div>
      <button onClick={onRemove} className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function MenuCuration() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id);
  const qc = useQueryClient();

  const { data: event } = useGetEvent(eventId, {
    query: { queryKey: getGetEventQueryKey(eventId) },
  });
  const { data: allDishes } = useGetDishes({
    query: { queryKey: getGetDishesQueryKey() },
  });
  const { data: currentMenu } = useGetEventMenu(eventId, {
    query: { queryKey: getGetEventMenuQueryKey(eventId) },
  });
  const setMenu = useSetEventMenu();

  const [menuDishes, setMenuDishes] = useState<MenuDish[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeCourse, setActiveCourse] = useState<Course>("Main");

  useEffect(() => {
    if (currentMenu) {
      setMenuDishes(
        currentMenu.map((e) => ({
          id: `${e.id}-${e.dishId}`,
          dishId: e.dishId,
          name: e.dish.name,
          category: e.dish.category,
          course: (e.course as Course) || "Main",
          sortOrder: e.sortOrder,
        }))
      );
    }
  }, [currentMenu]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const addDish = (dishId: number, course: Course) => {
    const dish = allDishes?.find((d) => d.id === dishId);
    if (!dish) return;
    const newEntry: MenuDish = {
      id: `new-${Date.now()}-${dishId}`,
      dishId,
      name: dish.name,
      category: dish.category,
      course,
      sortOrder: menuDishes.filter((m) => m.course === course).length,
    };
    setMenuDishes((prev) => [...prev, newEntry]);
  };

  const removeDish = (id: string) => {
    setMenuDishes((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setMenuDishes((prev) => {
      const oldIdx = prev.findIndex((d) => d.id === active.id);
      const newIdx = prev.findIndex((d) => d.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return prev;
      const newDishes = [...prev];
      const [moved] = newDishes.splice(oldIdx, 1);
      // Move to target course
      const targetDish = newDishes[newIdx < newDishes.length ? newIdx : newDishes.length - 1];
      if (targetDish) moved.course = targetDish.course;
      newDishes.splice(newIdx, 0, moved);
      return newDishes.map((d, i) => ({ ...d, sortOrder: i }));
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setMenu.mutateAsync({
        id: eventId,
        data: {
          entries: menuDishes.map((d, i) => ({
            dishId: d.dishId,
            course: d.course,
            sortOrder: i,
          })),
        },
      });
      qc.invalidateQueries({ queryKey: getGetEventMenuQueryKey(eventId) });
      toast.success("Menu saved");
    } catch {
      toast.error("Failed to save menu");
    } finally {
      setSaving(false);
    }
  };

  const courseDishes = (course: Course) => menuDishes.filter((d) => d.course === course);
  const availableDishes = allDishes?.filter(
    (d) => !menuDishes.some((m) => m.dishId === d.id && m.course === activeCourse)
  ) ?? [];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/inbox/${eventId}`}>
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Curate Menu</h1>
            {event && <p className="text-sm text-muted-foreground">{event.clientName} · {event.eventDate}</p>}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Menu"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dish library panel */}
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground mb-3">Add to Course</h2>
              <div className="flex flex-wrap gap-1">
                {COURSES.map((course) => (
                  <button
                    key={course}
                    onClick={() => setActiveCourse(course)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors
                      ${activeCourse === course ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                  >
                    {course}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 max-h-96 overflow-y-auto space-y-1.5">
              {availableDishes.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">All dishes added to {activeCourse}</p>
              ) : (
                availableDishes.map((dish) => (
                  <button
                    key={dish.id}
                    onClick={() => addDish(dish.id, activeCourse)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left group"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{dish.name}</div>
                      {dish.category && <div className="text-xs text-muted-foreground capitalize">{dish.category}</div>}
                    </div>
                  </button>
                ))
              )}
              {allDishes?.length === 0 && (
                <div className="text-center py-6">
                  <ChefHat className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">No dishes in library yet.</p>
                  <Link href="/dishes/new">
                    <button className="mt-2 text-xs text-primary hover:underline">Add a dish</button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Menu courses */}
          <div className="lg:col-span-2 space-y-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              {COURSES.map((course) => (
                <div key={course} className="bg-card border border-card-border rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">{course}s</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {courseDishes(course).length}
                    </span>
                  </div>
                  <div className="p-3 space-y-2 min-h-[60px]">
                    <SortableContext
                      items={courseDishes(course).map((d) => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {courseDishes(course).length === 0 ? (
                        <div className="text-center py-3 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
                          Drop dishes here
                        </div>
                      ) : (
                        courseDishes(course).map((dish) => (
                          <DishCard
                            key={dish.id}
                            dish={dish}
                            onRemove={() => removeDish(dish.id)}
                          />
                        ))
                      )}
                    </SortableContext>
                  </div>
                </div>
              ))}
            </DndContext>
          </div>
        </div>
      </div>
    </Layout>
  );
}
