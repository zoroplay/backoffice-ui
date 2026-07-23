"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";
import { withAuth } from "@/utils/withAuth";

type AnyRecord = Record<string, any>;

type MenuTarget = "web" | "shop" | "mobile" | "";

type SiteMenu = {
  id?: string | number;
  title?: string;
  target?: MenuTarget | string;
  parent?: string | number | null;
  parent_id?: string | number | null;
  link?: string;
  order?: string | number;
  status?: boolean | string | number;
  new_window?: boolean | string | number;
};

type MenuForm = {
  title: string;
  target: MenuTarget;
  parent_id: string;
  link: string;
  order: string;
  status: boolean;
  new_window: boolean;
  id: string;
};

const blankForm: MenuForm = {
  title: "",
  target: "web",
  parent_id: "",
  link: "#",
  order: "0",
  status: true,
  new_window: false,
  id: "",
};

const targetOptions: { value: Exclude<MenuTarget, "">; label: string; color: "info" | "warning" | "success" }[] = [
  { value: "web", label: "Web", color: "info" },
  { value: "mobile", label: "Mobile", color: "warning" },
  { value: "shop", label: "Shop", color: "success" },
];

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function listFrom(value: unknown): SiteMenu[] {
  if (Array.isArray(value)) return value as SiteMenu[];

  const record = asRecord(value);
  if (Array.isArray(record.data)) return record.data as SiteMenu[];
  if (Array.isArray(record.data?.data)) return record.data.data as SiteMenu[];
  if (Array.isArray(record.menus)) return record.menus as SiteMenu[];

  return [];
}

function successFrom(value: unknown) {
  const record = asRecord(value);
  return record.success === true || record.status === true || record.status_code === 200 || record.status_code === 201;
}

function menuId(menu: SiteMenu) {
  return String(menu.id ?? "");
}

function menuTitle(menu: SiteMenu) {
  return String(menu.title ?? "Untitled menu");
}

function menuTarget(menu: SiteMenu): MenuTarget {
  const target = String(menu.target ?? "web").toLowerCase();
  if (target === "shop" || target === "mobile" || target === "web") return target;
  return "web";
}

function parentValue(menu: SiteMenu) {
  return String(menu.parent_id ?? menu.parent ?? "");
}

function boolValue(value: SiteMenu["status"]) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function numberOrString(value: string) {
  const numeric = Number(value);
  return value.trim() !== "" && Number.isFinite(numeric) ? numeric : value;
}

function targetMeta(target: MenuTarget | string) {
  return targetOptions.find((option) => option.value === String(target).toLowerCase()) ?? targetOptions[0];
}

function SiteMenuPage() {
  const [menus, setMenus] = useState<SiteMenu[]>([]);
  const [form, setForm] = useState<MenuForm>(blankForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const sortedMenus = useMemo(
    () =>
      menus.slice().sort((left, right) => {
        const leftOrder = Number(left.order ?? 0);
        const rightOrder = Number(right.order ?? 0);
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        return menuTitle(left).localeCompare(menuTitle(right));
      }),
    [menus]
  );

  const activeCount = useMemo(() => menus.filter((menu) => boolValue(menu.status)).length, [menus]);

  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GETREQUEST<unknown>("/api/admin/content-management/menus");

      if (!response.ok) {
        toast.error(response.error ?? "Unable to load site menus");
        return;
      }

      setMenus(listFrom(response.data));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load site menus");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMenus();
  }, [loadMenus]);

  function editMenu(menu: SiteMenu) {
    setForm({
      title: String(menu.title ?? ""),
      target: menuTarget(menu),
      parent_id: parentValue(menu),
      link: String(menu.link ?? "#"),
      order: String(menu.order ?? "0"),
      status: boolValue(menu.status),
      new_window: boolValue(menu.new_window),
      id: menuId(menu),
    });
  }

  function resetForm() {
    setForm(blankForm);
  }

  async function submitMenu() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!form.link.trim()) {
      toast.error("URL is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        target: form.target,
        parent_id: form.parent_id,
        link: form.link.trim(),
        order: numberOrString(form.order),
        status: form.status,
        new_window: form.new_window,
        id: form.id,
      };
      const response = await POSTREQUEST<unknown>("/api/admin/content-management/menus", payload);

      if (!response.ok || !successFrom(response.data)) {
        toast.error(response.error ?? "An error occured");
        return;
      }

      const record = asRecord(response.data);
      const updatedMenus = listFrom(response.data);

      if (updatedMenus.length > 0) {
        setMenus(updatedMenus);
      } else if (!form.id && record.menu) {
        setMenus((current) => [...current, record.menu as SiteMenu]);
      } else {
        await loadMenus();
      }

      toast.success(form.id ? "Menu has been updated." : "Menu created successfully.");
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occured");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMenu(id: string) {
    if (!id || !window.confirm("Are you sure you want to delete this menu item?")) return;

    setDeletingId(id);
    try {
      const response = await GETREQUEST<unknown>(`/api/admin/content-management/menu/delete/${id}`);

      if (!response.ok || !successFrom(response.data)) {
        toast.error(response.error ?? "An error occured");
        return;
      }

      setMenus((current) => current.filter((menu) => menuId(menu) !== id));
      if (form.id === id) resetForm();
      toast.success("Menu item has been removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occured");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Site Menus" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,30rem)]">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu Items</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {menus.length} total, {activeCount} active
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadMenus()}
              disabled={loading}
              startIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
            >
              Refresh
            </Button>
          </div>

          <div className="mt-5 divide-y divide-gray-100 rounded-lg border border-gray-100 dark:divide-gray-800 dark:border-gray-800">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading site menus...</div>
            ) : sortedMenus.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No menu items found.</div>
            ) : (
              sortedMenus.map((menu) => {
                const id = menuId(menu);
                const target = targetMeta(menuTarget(menu));

                return (
                  <div key={id || `${menuTitle(menu)}-${menu.order}`} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editMenu(menu)}
                          className="truncate text-left text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        >
                          {menuTitle(menu)}
                        </button>
                        <Badge variant="light" color={target.color} size="sm">
                          {target.label}
                        </Badge>
                        <Badge variant="light" color={boolValue(menu.status) ? "success" : "neutral"} size="sm">
                          {boolValue(menu.status) ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>URL: {menu.link || "#"}</span>
                        <span>Order: {String(menu.order ?? 0)}</span>
                        <span>Parent: {parentValue(menu) || "None"}</span>
                        <span>New window: {boolValue(menu.new_window) ? "Yes" : "No"}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => editMenu(menu)} startIcon={<Edit3 className="h-4 w-4" />}>
                        Edit
                      </Button>
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() => void deleteMenu(id)}
                        disabled={deletingId === id}
                        startIcon={<Trash2 className="h-4 w-4" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{form.id ? "Edit Menu Item" : "Add Menu Item"}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Changes are saved to the CMS menu endpoint.</p>
          </div>

          <Form onSubmit={() => void submitMenu()} className="mt-5 space-y-5">
            <div>
              <Label htmlFor="site-menu-target">Target</Label>
              <select
                id="site-menu-target"
                value={form.target}
                onChange={(event) => setForm((current) => ({ ...current, target: event.target.value as MenuTarget }))}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {targetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="site-menu-title">Title</Label>
              <Input
                id="site-menu-title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Title"
              />
            </div>

            <div>
              <Label htmlFor="site-menu-parent">Parent Menu</Label>
              <select
                id="site-menu-parent"
                value={form.parent_id}
                onChange={(event) => setForm((current) => ({ ...current, parent_id: event.target.value }))}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Parent Menu</option>
                {sortedMenus
                  .filter((menu) => menuId(menu) !== form.id)
                  .map((menu) => (
                    <option key={menuId(menu)} value={menuId(menu)}>
                      {menuTitle(menu)}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <Label htmlFor="site-menu-link">URL</Label>
              <Input
                id="site-menu-link"
                value={form.link}
                onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
                placeholder="URL"
              />
            </div>

            <div>
              <Label htmlFor="site-menu-order">Order</Label>
              <Input
                id="site-menu-order"
                type="number"
                value={form.order}
                onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))}
                placeholder="0"
              />
            </div>

            <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              is Active
            </label>

            <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.new_window}
                onChange={(event) => setForm((current) => ({ ...current, new_window: event.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              Open in new window
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                Cancel
              </Button>
            </div>
          </Form>
        </section>
      </div>
    </div>
  );
}

export default withAuth(SiteMenuPage);
