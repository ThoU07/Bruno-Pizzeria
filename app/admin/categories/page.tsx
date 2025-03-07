// app/admin/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ICategory } from "@/types/category";
import { DataTable } from "@/components/data-table";
import { useConfirm } from "@/lib/stores/use-confirm";
import { toast } from "sonner";
import {
  createCategory,
  getCategories,
  updateCategory,
} from "@/lib/actions/category.action";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null
  );
  const [isLoading, setLoading] = useState(true);
  const { confirm } = useConfirm();

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
    };

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.$id, data);
        setCategories((prev) =>
          prev.map((c) =>
            c.$id === editingCategory.$id ? { ...c, ...data } : c
          )
        );
      } else {
        const doc = await createCategory(data);
        setCategories((prev) => [...prev, { ...data, $id: doc.$id }]);
      }

      toast.success(
        `${editingCategory ? "Update" : "Create"} category successfully!`
      );
    } catch (error) {
      console.log(error);
      toast.error(
        `Something went wrong ${
          editingCategory ? "update" : "create"
        } category!`
      );
    }

    setIsOpen(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: ICategory) => {
    setEditingCategory(category);
    setIsOpen(true);
  };

  const handleClose = (open: boolean) => {
    if (!open) setEditingCategory(null);

    setIsOpen(open);
  };

  useEffect(() => {
    if (!categories.length) fetchCategories();
  }, []);

  const handleDelete = async (item: ICategory) => {
    await confirm.danger("Are you sure to delete this category?", async () => {
      try {
        const res = await fetch(`/api/category?id=${item.$id}`, {
          method: "DELETE",
        });

        if (res.status !== 200) throw new Error("Something went wrong!");

        toast.success(`Deleted ${item.name}`);
        setCategories((prev) => prev.filter((c) => c.$id !== item.$id));
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong!");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            <Button className="bg-green hover:bg-green/60">
              <Plus className="mr-2 h-4 w-4" /> New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Update Category" : "New Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingCategory?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={editingCategory?.slug}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green hover:bg-green/60"
              >
                {editingCategory ? "Save" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}
