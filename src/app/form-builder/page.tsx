"use client";

import dynamic from "next/dynamic";
import "react-form-builder2/dist/app.css";

const FormBuilder = dynamic(
  () => import("react-form-builder2").then((mod) => mod.ReactFormBuilder),
  { ssr: false }
);

export default function FormBuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Dynamic Form Builder</h1>
      <FormBuilder
        url="api/form/load"       // 👈 Backend API to load saved form
        saveUrl="api/form/save"   // 👈 Backend API to save form updates
      />
    </div>
  );
}
