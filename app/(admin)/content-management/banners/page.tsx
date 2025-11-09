"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Select, { type SingleValue } from "react-select";
import Image from "next/image";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { FilterActions } from "@/components/common/FilterActions";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { withAuth } from "@/utils/withAuth";

import { columns, BannerRow, createActionColumn } from "./columns";
import { BannerItem, bannerItems } from "./data";

 type FilterOption = { value: string; label: string };
 type SelectOption<T extends string> = { value: T; label: string };
 type ImageSource = "url" | "upload";

 const bannerTypeOptions: SelectOption<BannerItem["type"]>[] = [
   { value: "Sports", label: "Sports" },
   { value: "Registration", label: "Registration" },
   { value: "Casino", label: "Casino" },
   { value: "Promotion", label: "Promotion" },
 ];

 const bannerTargetOptions: SelectOption<BannerItem["target"]>[] = [
   { value: "Web", label: "Web" },
   { value: "Mobile", label: "Mobile" },
   { value: "All", label: "All" },
 ];

 const bannerPositionOptions: SelectOption<BannerItem["position"]>[] = [
   { value: "Slider", label: "Slider" },
   { value: "Popup", label: "Popup" },
   { value: "Hero", label: "Hero" },
 ];

 const filterOptions: { label: string; options: FilterOption[] }[] = [
   {
     label: "Type",
     options: bannerTypeOptions.map((option) => ({
       value: `type:${option.value}`,
       label: option.label,
     })),
   },
   {
     label: "Target",
     options: bannerTargetOptions.map((option) => ({
       value: `target:${option.value}`,
       label: option.label,
     })),
   },
   {
     label: "Status",
     options: [
       { value: "status:Active", label: "Active" },
       { value: "status:Inactive", label: "Inactive" },
     ],
   },
 ];

 const mapBannerToRow = (banner: BannerItem): BannerRow => ({
   id: banner.id,
   title: banner.title,
   type: banner.type,
   target: banner.target,
   position: banner.position,
   link: banner.link,
   imageUrl: banner.imageUrl,
   isActive: banner.isActive,
   lastUpdated: banner.lastUpdated,
 });

 const applyFilter = (rows: BannerRow[], filter: FilterOption | null) => {
   if (!filter) {
     return rows;
   }

   const [type, value] = filter.value.split(":");

   if (type === "type") {
     return rows.filter((row) => row.type === value);
   }

   if (type === "target") {
     return rows.filter((row) => row.target === value);
   }

   if (type === "status") {
     const isActive = value === "Active";
     return rows.filter((row) => row.isActive === isActive);
   }

   return rows;
 };

 function BannersPage() {
   const { theme } = useTheme();

   const [banners, setBanners] = useState<BannerRow[]>(() => bannerItems.map(mapBannerToRow));
   const [activeFilter, setActiveFilter] = useState<FilterOption | null>(null);
   const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingBanner, setEditingBanner] = useState<BannerRow | null>(null);
   const [typeSelection, setTypeSelection] = useState<SelectOption<BannerItem["type"]> | null>(
     bannerTypeOptions[0]
   );
   const [targetSelection, setTargetSelection] = useState<SelectOption<BannerItem["target"]> | null>(
     bannerTargetOptions[0]
   );
   const [positionSelection, setPositionSelection] = useState<
     SelectOption<BannerItem["position"]> | null
   >(bannerPositionOptions[0] ?? null);
   const [formValues, setFormValues] = useState({
     title: "",
     link: "",
     content: "",
     imageUrl: "",
     isActive: true,
   });
   const [formKey, setFormKey] = useState(0);
   const [imageSource, setImageSource] = useState<ImageSource>("url");
   const [imagePreview, setImagePreview] = useState<string>("");
   const [uploadedFileName, setUploadedFileName] = useState<string>("");
   const uploadInputRef = useRef<HTMLInputElement | null>(null);

   const cleanupPreview = useCallback(() => {
     setImagePreview("");
     setUploadedFileName("");
     if (uploadInputRef.current) {
       uploadInputRef.current.value = "";
     }
   }, []);

   const applyPreview = useCallback((value: string) => {
     setImagePreview(value);
   }, []);

   const filteredRows = useMemo(
     () => applyFilter(banners, activeFilter),
     [banners, activeFilter]
   );

   const summary = useMemo(() => {
     const total = filteredRows.length;
     const active = filteredRows.filter((row) => row.isActive).length;
     const sliderCount = filteredRows.filter((row) => row.position === "Slider").length;

     return {
       total,
       active,
       sliderCount,
     };
   }, [filteredRows]);

   const openCreateModal = () => {
     cleanupPreview();
     setEditingBanner(null);
     setFormValues({
       title: "",
       link: "",
       content: "",
       imageUrl: "",
       isActive: true,
     });
     setTypeSelection(bannerTypeOptions[0]);
     setTargetSelection(bannerTargetOptions[0]);
     setPositionSelection(bannerPositionOptions[0] ?? null);
     setFormKey((key) => key + 1);
     setImageSource("url");
     setIsModalOpen(true);
   };

   const handleEdit = useCallback((banner: BannerRow) => {
     cleanupPreview();
     setEditingBanner(banner);
     setFormValues({
       title: banner.title,
       link: banner.link,
       content: "",
       imageUrl: banner.imageUrl,
       isActive: banner.isActive,
     });
     setTypeSelection(bannerTypeOptions.find((option) => option.value === banner.type) ?? null);
     setTargetSelection(bannerTargetOptions.find((option) => option.value === banner.target) ?? null);
     setPositionSelection(
       bannerPositionOptions.find((option) => option.value === banner.position) ?? null
     );
     setFormKey((key) => key + 1);
     setImageSource("url");
     applyPreview(banner.imageUrl);
     setIsModalOpen(true);
   }, [applyPreview, cleanupPreview]);

   const handleDelete = useCallback(
     (bannerId: string) => {
       const banner = banners.find((item) => item.id === bannerId);
       if (!banner) return;

       const confirmed = window.confirm(`Remove banner "${banner.title}"?`);
       if (!confirmed) return;

       setBanners((prev) => prev.filter((item) => item.id !== bannerId));
     },
     [banners]
   );

   const closeModal = () => {
     setIsModalOpen(false);
     cleanupPreview();
   };

   const handleSearch = () => {
     setActiveFilter(selectedFilter);
   };

   const handleClear = () => {
     setSelectedFilter(null);
     setActiveFilter(null);
   };

   const handleFormSubmit = () => {
     if (!formValues.title.trim()) {
       alert("Please provide a banner title.");
       return;
     }

     if (!typeSelection || !targetSelection || !positionSelection) {
       alert("Please select banner type, target, and position.");
       return;
     }

     const finalImage =
       imageSource === "upload"
         ? imagePreview
         : formValues.imageUrl.trim() || imagePreview || editingBanner?.imageUrl || "";

     if (!finalImage) {
       alert("Please provide a banner image.");
       return;
     }

     const now = new Date().toISOString();

     if (editingBanner) {
       setBanners((prev) =>
         prev.map((banner) =>
           banner.id === editingBanner.id
             ? {
                 ...banner,
                 title: formValues.title.trim(),
                 link: formValues.link.trim(),
                 imageUrl: finalImage,
                 type: typeSelection.value,
                 target: targetSelection.value,
                 position: positionSelection.value,
                 isActive: formValues.isActive,
                 lastUpdated: now,
               }
             : banner
         )
       );
       alert("Banner updated (mock).");
     } else {
       const newBanner: BannerRow = {
         id: `banner-${Date.now()}`,
         title: formValues.title.trim(),
         link: formValues.link.trim(),
         imageUrl:
           finalImage ||
           "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=600&q=80",
         type: typeSelection.value,
         target: targetSelection.value,
         position: positionSelection.value,
         isActive: formValues.isActive,
         lastUpdated: now,
       };

       setBanners((prev) => [newBanner, ...prev]);
       alert("Banner created (mock).");
     }

     setIsModalOpen(false);
     cleanupPreview();
   };

   const columnsWithActions = useMemo(
     () => [...columns, createActionColumn({ onEdit: handleEdit, onDelete: handleDelete })],
     [handleDelete, handleEdit]
   );

   return (
     <div className="space-y-6 p-4">
       <PageBreadcrumb pageTitle="Site Banners" />

       <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
         <div className="flex flex-wrap items-center justify-between gap-4">
           <div className="space-y-1">
             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Banners</h2>
             <p className="text-sm text-gray-500 dark:text-gray-400">
               Keep hero sliders, promotions, and popups in sync across channels.
             </p>
           </div>
           <Button onClick={openCreateModal} className="bg-emerald-500 text-white hover:bg-emerald-600">
             Add New Banner
           </Button>
         </div>

         <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
           <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
             <p className="text-sm text-gray-500 dark:text-gray-400">Total Banners</p>
             <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</p>
           </div>
           <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
             <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
             <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.active}</p>
           </div>
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
             <p className="text-sm text-gray-500 dark:text-gray-400">Slider Positions</p>
             <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.sliderCount}</p>
           </div>
         </div>
       </div>

       <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
         <div className="flex flex-wrap items-center justify-between gap-4">
           <div className="w-full max-w-[20rem]">
             <Select<FilterOption, false>
               styles={reactSelectStyles(theme)}
               options={filterOptions}
               placeholder="Filter by Type, Target, or Status"
               value={selectedFilter}
               onChange={(option: SingleValue<FilterOption>) => setSelectedFilter(option ?? null)}
               isClearable
             />
           </div>
           <FilterActions onSearch={handleSearch} onClear={handleClear} />
         </div>

         <div className="mt-6 space-y-4">
           <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/70">
             <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">List</h3>
           </div>

           <DataTable
             columns={columnsWithActions}
             data={filteredRows}
             onRowClick={(row) => handleEdit(row.original)}
           />
         </div>
       </div>

       <Modal isOpen={isModalOpen} onClose={closeModal} size="lg">
         <ModalHeader>{editingBanner ? "Edit Banner" : "Add New Banner"}</ModalHeader>
         <ModalBody>
           <Form
             key={formKey}
             onSubmit={() => {
               handleFormSubmit();
             }}
             className="space-y-6"
           >
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <div>
                 <Label htmlFor="bannerTitle">Title</Label>
                 <Input
                   id="bannerTitle"
                   placeholder="Banner title"
                   defaultValue={formValues.title}
                   onChange={(event) =>
                     setFormValues((prev) => ({ ...prev, title: event.target.value }))
                   }
                 />
               </div>
               <div>
                 <Label htmlFor="bannerLink">Link</Label>
                 <Input
                   id="bannerLink"
                   placeholder="https://..."
                   defaultValue={formValues.link}
                   onChange={(event) =>
                     setFormValues((prev) => ({ ...prev, link: event.target.value }))
                   }
                 />
               </div>
               <div>
                 <Label>Type</Label>
                 <Select<SelectOption<BannerItem["type"]>, false>
                   styles={reactSelectStyles(theme)}
                   options={bannerTypeOptions}
                   value={typeSelection}
                   onChange={(option) => setTypeSelection(option as SelectOption<BannerItem["type"]>)}
                 />
               </div>
               <div>
                 <Label>Target</Label>
                 <Select<SelectOption<BannerItem["target"]>, false>
                   styles={reactSelectStyles(theme)}
                   options={bannerTargetOptions}
                   value={targetSelection}
                   onChange={(option) =>
                     setTargetSelection(option as SelectOption<BannerItem["target"]>)
                   }
                 />
               </div>
               <div className="md:col-span-2">
                 <Label>Position</Label>
                 <Select<SelectOption<BannerItem["position"]>, false>
                   styles={reactSelectStyles(theme)}
                   options={bannerPositionOptions}
                   value={positionSelection}
                   onChange={(option) =>
                     setPositionSelection(option as SelectOption<BannerItem["position"]>)
                   }
                 />
               </div>
               <div className="md:col-span-2">
                 <Label>Image Source</Label>
                 <div className="mt-2 inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
                   <button
                     type="button"
                     className={`rounded-md px-3 py-1 text-sm font-medium transition focus:outline-hidden ${
                       imageSource === "url"
                         ? "bg-brand-500 text-white"
                         : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                     }`}
                     onClick={() => {
                       setImageSource("url");
                       if (!formValues.imageUrl && (editingBanner?.imageUrl || imagePreview)) {
                         const source = editingBanner?.imageUrl || imagePreview;
                         if (source) {
                           applyPreview(source);
                           setFormValues((prev) => ({ ...prev, imageUrl: source }));
                         }
                       }
                       setUploadedFileName("");
                     }}
                   >
                     Image URL
                   </button>
                   <button
                     type="button"
                     className={`rounded-md px-3 py-1 text-sm font-medium transition focus:outline-hidden ${
                       imageSource === "upload"
                         ? "bg-brand-500 text-white"
                         : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                     }`}
                     onClick={() => {
                       setImageSource("upload");
                       if (editingBanner?.imageUrl && !imagePreview) {
                         applyPreview(editingBanner.imageUrl);
                       }
                     }}
                   >
                     Upload
                   </button>
                 </div>
               </div>
               {imageSource === "url" ? (
                 <div className="md:col-span-2">
                   <Label htmlFor="bannerImage">Image URL</Label>
                   <Input
                     id="bannerImage"
                     placeholder="https://cdn.example.com/banner.jpg"
                     defaultValue={formValues.imageUrl}
                     onChange={(event) => {
                       const value = event.target.value;
                       setFormValues((prev) => ({ ...prev, imageUrl: value }));
                       applyPreview(value);
                     }}
                   />
                   <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                     Paste a direct image link (JPG, PNG, or WebP).
                   </p>
                 </div>
               ) : (
                 <div className="md:col-span-2">
                   <Label htmlFor="bannerUpload">Upload Image</Label>
                   <div className="mt-2 flex items-center gap-3">
                     <label
                       htmlFor="bannerUpload"
                       className="inline-flex cursor-pointer items-center rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-theme-xs transition hover:bg-brand-600"
                     >
                       Choose File
                     </label>
                     <span className="text-sm text-gray-600 dark:text-gray-400">
                       {uploadedFileName || "No file selected"}
                     </span>
                   </div>
                   <input
                     id="bannerUpload"
                     ref={uploadInputRef}
                     type="file"
                     accept="image/*"
                     className="sr-only"
                     onChange={(event) => {
                       const file = event.target.files?.[0];
                       if (!file) return;
                       const reader = new FileReader();
                       reader.onload = () => {
                         const result = reader.result;
                         if (typeof result === "string") {
                           applyPreview(result);
                           setUploadedFileName(file.name);
                           setFormValues((prev) => ({ ...prev, imageUrl: "" }));
                         }
                       };
                       reader.readAsDataURL(file);
                     }}
                   />
                   <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                     Accepts JPG, PNG, or WebP up to 5MB. Uploads are mocked locally and stored as a preview only.
                   </p>
                 </div>
               )}
               <div className="md:col-span-2">
                 <Label>Notes</Label>
                 <TextArea
                   placeholder="Internal notes for this banner"
                   rows={3}
                   value={formValues.content}
                   onChange={(value) => setFormValues((prev) => ({ ...prev, content: value }))}
                 />
               </div>
             </div>

             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <Switch
                 key={`banner-active-${formKey}`}
                 label="Is Active"
                 defaultChecked={formValues.isActive}
                 onChange={(checked) =>
                   setFormValues((prev) => ({
                     ...prev,
                     isActive: checked,
                   }))
                 }
               />
             </div>

             {(imagePreview || editingBanner?.imageUrl) && (
               <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                 <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Preview</p>
                 <div className="mt-3 flex items-center gap-4">
                   <div className="relative h-24 w-44 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                     <Image
                       src={(imagePreview || editingBanner?.imageUrl)!}
                       alt={formValues.title || editingBanner?.title || "Banner preview"}
                       fill
                       sizes="176px"
                       className="object-cover"
                       unoptimized
                     />
                   </div>
                   <p className="text-xs text-gray-500 dark:text-gray-400">
                     Preview updates as you adjust the banner image URL.
                   </p>
                 </div>
               </div>
             )}
           </Form>
         </ModalBody>
         <ModalFooter>
           <Button variant="outline" onClick={closeModal}>
             Cancel
           </Button>
           <Button onClick={handleFormSubmit}>
             {editingBanner ? "Update Banner" : "Save Banner"}
           </Button>
         </ModalFooter>
       </Modal>
     </div>
   );
 }

 export default withAuth(BannersPage);
