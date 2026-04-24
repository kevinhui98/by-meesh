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
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  GripVertical,
  Plus,
  X,
  Save,
  ChefHat,
  Minus,
} from "lucide-react";
import { useLocation } from "wouter";
const COURSES = ["Appetizer", "Main", "Side", "Dessert", "Beverage"] as const;
type Course = (typeof COURSES)[number];

interface MenuDish {
  id: string;
  dishId: number;
  name: string;
  category?: string | null;
  course: Course;
  sortOrder: number;
  quantity: number;
}

function DishCard({
  dish,
  onRemove,
  onQuantityChange,
}: {
  dish: MenuDish;
  onRemove: () => void;
  onQuantityChange: (qty: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dish.id, data: { course: dish.course } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-card border border-card-border rounded-lg px-3 py-2.5 group"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground shrink-0"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {dish.name}
        </div>
        {dish.category && (
          <div className="text-xs text-muted-foreground capitalize">
            {dish.category}
          </div>
        )}
      </div>
      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onQuantityChange(Math.max(1, dish.quantity - 1))}
          className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-sm font-medium text-foreground w-5 text-center">
          {dish.quantity}
        </span>
        <button
          onClick={() => onQuantityChange(dish.quantity + 1)}
          className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <button
        onClick={onRemove}
        className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0 ml-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function DishCardOverlay({ dish }: { dish: MenuDish }) {
  return (
    <div className="flex items-center gap-2 bg-card border border-primary/30 rounded-lg px-3 py-2.5 shadow-lg opacity-95">
      <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {dish.name}
        </div>
        {dish.category && (
          <div className="text-xs text-muted-foreground capitalize">
            {dish.category}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseDropZone({
  course,
  children,
  isEmpty,
}: {
  course: Course;
  children: React.ReactNode;
  isEmpty: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `course-${course}` });
  return (
    <div
      ref={setNodeRef}
      className={`p-3 space-y-2 min-h-[60px] transition-colors ${isOver && isEmpty ? "bg-primary/5 rounded-lg" : ""}`}
    >
      {isEmpty ? (
        <div
          className={`text-center py-3 text-xs text-muted-foreground border-2 border-dashed rounded-lg transition-colors
            ${isOver ? "border-primary/50 text-primary" : "border-border"}`}
        >
          {isOver ? "Release to drop here" : "Drop dishes here"}
        </div>
      ) : (
        children
      )}
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

  const [, navigate] = useLocation();

  const [menuDishes, setMenuDishes] = useState<MenuDish[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeCourse, setActiveCourse] = useState<Course>("Main");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

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
          quantity: e.quantity ?? 1,
        })),
      );
    }
  }, [currentMenu]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

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
      quantity: 1,
    };
    setMenuDishes((prev) => [...prev, newEntry]);
  };

  const removeDish = (id: string) => {
    setMenuDishes((prev) => prev.filter((d) => d.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    setMenuDishes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, quantity: Math.max(1, qty) } : d)),
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isCourseContainer = overId.startsWith("course-");
    const targetCourse = isCourseContainer
      ? (overId.replace("course-", "") as Course)
      : (menuDishes.find((d) => d.id === overId)?.course ?? null);

    if (!targetCourse) return;

    setMenuDishes((prev) => {
      const activeItem = prev.find((d) => d.id === activeId);
      if (!activeItem) return prev;

      if (activeItem.course === targetCourse && !isCourseContainer) return prev;

      if (activeItem.course !== targetCourse) {
        return prev.map((d) =>
          d.id === activeId ? { ...d, course: targetCourse } : d,
        );
      }

      return prev;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    if (overId.startsWith("course-")) return;

    setMenuDishes((prev) => {
      const oldIdx = prev.findIndex((d) => d.id === activeId);
      const newIdx = prev.findIndex((d) => d.id === overId);
      if (oldIdx === -1 || newIdx === -1) return prev;

      const result = arrayMove(prev, oldIdx, newIdx);
      return result.map((d, i) => ({ ...d, sortOrder: i }));
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
            quantity: d.quantity,
          })),
        },
      });
      qc.invalidateQueries({ queryKey: getGetEventMenuQueryKey(eventId) });
      toast.success("Menu saved");
      // clear saving state before navigating so we don't set state on an unmounted component
      setSaving(false);
      // navigate back to the event inbox page
      navigate(`/inbox/${eventId}`);
      return;
    } catch {
      toast.error("Failed to save menu");
    } finally {
      setSaving(false);
    }
  };

  const courseDishes = (course: Course) =>
    menuDishes.filter((d) => d.course === course);

  const availableDishes =
    allDishes?.filter(
      (d) =>
        !menuDishes.some((m) => m.dishId === d.id && m.course === activeCourse),
    ) ?? [];

  const activeDish = activeDragId
    ? menuDishes.find((d) => d.id === activeDragId)
    : null;

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
            {event && (
              <p className="text-sm text-muted-foreground">
                {event.clientName} · {event.eventDate}
              </p>
            )}
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
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Add to Course
              </h2>
              <div className="flex flex-wrap gap-1">
                {COURSES.map((course) => (
                  <button
                    key={course}
                    onClick={() => setActiveCourse(course)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors
                      ${
                        activeCourse === course
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                  >
                    {course}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 max-h-96 overflow-y-auto space-y-1.5">
              {availableDishes.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  All dishes added to {activeCourse}
                </p>
              ) : (
                availableDishes.map((dish) => (
                  <button
                    key={dish.id}
                    onClick={() => addDish(dish.id, activeCourse)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left group"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {dish.name}
                      </div>
                      {dish.category && (
                        <div className="text-xs text-muted-foreground capitalize">
                          {dish.category}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
              {allDishes?.length === 0 && (
                <div className="text-center py-6">
                  <ChefHat className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">
                    No dishes in library yet.
                  </p>
                  <Link href="/dishes/new">
                    <button className="mt-2 text-xs text-primary hover:underline">
                      Add a dish
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Menu courses */}
          <div className="lg:col-span-2 space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {COURSES.map((course) => {
                const dishes = courseDishes(course);
                return (
                  <div
                    key={course}
                    className="bg-card border border-card-border rounded-2xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        {course}s
                      </h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {dishes.length}
                      </span>
                    </div>
                    <SortableContext
                      items={dishes.map((d) => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <CourseDropZone
                        course={course}
                        isEmpty={dishes.length === 0}
                      >
                        {dishes.map((dish) => (
                          <DishCard
                            key={dish.id}
                            dish={dish}
                            onRemove={() => removeDish(dish.id)}
                            onQuantityChange={(qty) =>
                              updateQuantity(dish.id, qty)
                            }
                          />
                        ))}
                      </CourseDropZone>
                    </SortableContext>
                  </div>
                );
              })}

              <DragOverlay>
                {activeDish ? <DishCardOverlay dish={activeDish} /> : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>
    </Layout>
  );
}
