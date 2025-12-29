'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Undo2, RotateCcw } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Category {
    id: string;
    name: string;
    bullets: string[];
}

export default function CategoryEditor() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loading, setLoading] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [undoStack, setUndoStack] = useState<Category[] | null>(null);
    const [initialState, setInitialState] = useState<Category[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/admin/landing');
                const data = await res.json();
                const loaded = data?.categories || [];
                setCategories(loaded);
                setInitialState(loaded);
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        };
        fetchCategories();
    }, []);

    const saveCategories = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('payload', JSON.stringify({ categories }));

            const res = await fetch('http://localhost:5000/api/admin/landing', {
                method: 'PATCH',
                body: formData,
            });

            const result = await res.json();
            if (!result.ok) {
                alert('Failed to save categories');
            } else {
                alert('Categories saved successfully!');
                setDirty(false);
                setInitialState(categories);
                setUndoStack(null);
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = categories.findIndex((c) => c.id === String(active.id));
        const newIndex = categories.findIndex((c) => c.id === String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;
        const reordered = arrayMove(categories, oldIndex, newIndex);
        setUndoStack(categories);
        setCategories(reordered);
        setDirty(true);
    };

    const addCategory = () => {
        if (!newCategoryName.trim()) return;
        const newCat: Category = {
            id: Date.now().toString(),
            name: newCategoryName.trim(),
            bullets: [],
        };
        setUndoStack(categories);
        setCategories((prev) => [...prev, newCat]);
        setNewCategoryName('');
        setDirty(true);
    };

    const removeCategory = (catId: string) => {
        setUndoStack(categories);
        setCategories((prev) => prev.filter((cat) => cat.id !== catId));
        setDirty(true);
    };

    const addBullet = (catId: string, bullet: string) => {
        if (!bullet.trim()) return;
        setUndoStack(categories);
        setCategories((prev) =>
            prev.map((cat) =>
                cat.id === catId
                    ? { ...cat, bullets: [...cat.bullets, bullet.trim()] }
                    : cat
            )
        );
        setDirty(true);
    };

    const removeBullet = (catId: string, index: number) => {
        setUndoStack(categories);
        setCategories((prev) =>
            prev.map((cat) =>
                cat.id === catId
                    ? {
                        ...cat,
                        bullets: cat.bullets.filter((_, i) => i !== index),
                    }
                    : cat
            )
        );
        setDirty(true);
    };

    const updateCategoryName = (catId: string, name: string) => {
        setCategories((prev) =>
            prev.map((cat) => (cat.id === catId ? { ...cat, name } : cat))
        );
        setDirty(true);
    };

    const updateBullet = (catId: string, index: number, text: string) => {
        setCategories((prev) =>
            prev.map((cat) =>
                cat.id === catId
                    ? {
                        ...cat,
                        bullets: cat.bullets.map((b, i) => (i === index ? text : b)),
                    }
                    : cat
            )
        );
        setDirty(true);
    };

    const handleUndo = () => {
        if (undoStack) {
            setCategories(undoStack);
            setUndoStack(null);
            setDirty(true);
        }
    };

    const handleReset = () => {
        setCategories(initialState);
        setUndoStack(null);
        setDirty(false);
    };

    return (
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Category Editor</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleUndo}
                        disabled={!undoStack}
                        className="text-sm px-3 py-2 border rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                    >
                        <Undo2 className="w-4 h-4 inline mr-1" />
                        Undo
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={!dirty}
                        className="text-sm px-3 py-2 border rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                    >
                        <RotateCcw className="w-4 h-4 inline mr-1" />
                        Reset
                    </button>
                    <button
                        onClick={saveCategories}
                        disabled={!dirty || loading}
                        className="bg-[#253A7B] text-white px-4 py-2 rounded hover:bg-[#1a2a5e] transition text-sm disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="flex gap-3">
                <input
                    type="text"
                    placeholder="Enter category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm focus:ring-2 focus:ring-[#253A7B] focus:outline-none"
                />
                <button
                    onClick={addCategory}
                    className="bg-[#253A7B] text-white px-4 py-2 rounded hover:bg-[#1a2a5e] transition text-sm flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {categories.length === 0 ? (
                <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded p-6 text-center">
                    No categories added yet.
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4">
                            {categories.map((cat) => (
                                <SortableCategoryCard
                                    key={cat.id}
                                    category={cat}
                                    onRemove={() => removeCategory(cat.id)}
                                    onAddBullet={(text) => addBullet(cat.id, text)}
                                    onRemoveBullet={(index) => removeBullet(cat.id, index)}
                                    onUpdateCategoryName={(name) => updateCategoryName(cat.id, name)}
                                    onUpdateBullet={(index, text) => updateBullet(cat.id, index, text)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </section>
    );
}

function SortableCategoryCard({
    category,
    onRemove,
    onAddBullet,
    onRemoveBullet,
    onUpdateCategoryName,
    onUpdateBullet,
}: {
    category: Category;
    onRemove: () => void;
    onAddBullet: (text: string) => void;
    onRemoveBullet: (index: number) => void;
    onUpdateCategoryName: (name: string) => void;
    onUpdateBullet: (index: number, text: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50 cursor-grab">
                <div className="flex justify-between items-center">
                    <input
                        type="text"
                        value={category.name}
                        onChange={(e) => onUpdateCategoryName(e.target.value)}
                        className="text-base font-medium text-gray-800 bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none"
                    />
                    <button
                        onClick={onRemove}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete category"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {category.bullets.map((bullet, i) => (
                        <li key={i} className="flex justify-between items-center gap-2">
                            <input
                                type="text"
                                value={bullet}
                                onChange={(e) => onUpdateBullet(i, e.target.value)}
                                className="flex-1 bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none"
                            />
                            <button
                                onClick={() => onRemoveBullet(i)}
                                className="text-xs text-red-400 hover:text-red-600"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>

                <BulletInput onAdd={onAddBullet} />
            </div>
        </div>
    );
}

function BulletInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <div className="flex gap-3">
      <input
        type="text"
        placeholder="Add bullet"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault(); // ✅ Prevent form submission, not typing
            handleSubmit();
          }
        }}
        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-[#253A7B] focus:outline-none"
      />
      <button
        onClick={handleSubmit}
        className="text-sm px-3 py-2 border rounded text-gray-700 hover:bg-gray-100"
        title="Add bullet"
      >
        Add
      </button>
    </div>
  );
}



