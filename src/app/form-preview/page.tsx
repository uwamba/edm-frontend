"use client";

import dynamic from "next/dynamic";
import "react-form-builder2/dist/app.css";

const FormGenerator = dynamic(
  () => import("react-form-builder2").then((mod) => mod.ReactFormGenerator),
  { ssr: false }
);

const sampleForm = [
  { id: "1", element: "Header", text: "Form Preview", static: true },
  { id: "2", element: "TextInput", label: "Your Name", required: true },
  { id: "3", element: "TextArea", label: "Your Feedback" },
];

export default function FormPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Form Preview</h1>
      <FormGenerator
       answer_data={[]}
        form_action="/api/form/submit"
        form_method="POST"
        task_id={1}
        data={sampleForm}
      />
    </div>
  );
}
