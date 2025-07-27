/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Dialog } from "@headlessui/react";
interface ApprovalStep {
  id: number;
  step_number: number;
  status: string; // 'approved', 'rejected', 'pending', etc.
  job_title: { id: number; name: string } | null; // replaced approver with job_title
}


interface ApprovalProcess {
  steps: ApprovalStep[];
}

interface Field {
  id: number;
  name: string;
  label: string;
  type: string;
}

interface Company {
  id: number;
  name: string;
  // add other fields you need
}

interface Manager {
  id: number;
  name: string;
  // add other fields you need
}

interface JobTitle {
  id: number;
  name: string;
  // add other fields you need
}

interface User {
  id: number;
  name: string;
  email: string;
  company?: Company;
  manager?: Manager;
  job_title: JobTitle; // note camelCase to match JSON keys
}

interface Form {
  id: number;
  title: string;
  description: string;
  fields: Field[];
  creator?: User;
  // approval_process is removed from here, since we fetch it separately on demand
}

interface SubmittedField {
  id: number;
  value: string;
  field?: { id: number; name: string; label: string; type: string; options?: string[] };
  children?: Record<string, string>[];
}

interface Submission {
  id: number;
  form_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
  form?: Form;
  fields?: SubmittedField[];
}

export default function SubmissionsList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  // Selected submission for modal
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  // Approval process for selected submission (fetched on demand)
  const [approvalProcess, setApprovalProcess] = useState<ApprovalProcess | null>(null);
  const [loadingApproval, setLoadingApproval] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return;

    try {
      const minimalUser = JSON.parse(userJson);
      if (!minimalUser.id) return;

      // Fetch full user details
      fetch(`http://localhost:8000/api/users/${minimalUser.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user");
          return res.json();
        })
        .then((fullUser: User) => {
          console.log("Fetched full user data:", fullUser);
          setLoggedUser(fullUser);
        })
        .catch((error) => {
          console.error("Error fetching full user data:", error);
          setLoggedUser(null);
        });
    } catch {
      setLoggedUser(null);
    }
  }, []);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await axios.get("http://localhost:8000/api/form/submissions/list");
        const rawSubs: Submission[] = res.data.data;
        setSubmissions(rawSubs);
      } catch (err) {
        console.error("Failed to fetch submissions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, []);

  // Fetch approval process when user clicks Details
  async function openDetails(submission: Submission) {
    setSelectedSubmission(submission);
    setApprovalProcess(null); // reset previous approval process

    if (!submission.form) return;

    setLoadingApproval(true);
    try {
      const res = await axios.get<ApprovalProcess>(
        `http://localhost:8000/api/forms/${submission.form.id}/approval-process`
      );
      setApprovalProcess(res.data);
    } catch (error) {
      console.error("Failed to load approval process", error);
      setApprovalProcess(null);
    } finally {
      setLoadingApproval(false);
    }
  }

  // Render submitted field value by type
  function renderFieldValue(sf: SubmittedField) {
    const type = sf.field?.type;

    if (!type) return <span className="text-red-500">Invalid field definition</span>;

    if (type === "multiselect") {
      let values: string[] = [];
      try {
        values = JSON.parse(sf.value);
        if (!Array.isArray(values)) values = [];
      } catch {
        values = sf.value.split(",").map((v) => v.trim());
      }

      return (
        <div className="flex flex-wrap gap-2">
          {values.map((val, i) => (
            <span
              key={i}
              className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-300"
            >
              {val}
            </span>
          ))}
        </div>
      );
    }

    if (type === "select") return <span>{sf.value}</span>;
    if (type === "checkbox") return <span>{sf.value === "1" || sf.value === "true" ? "Yes" : "No"}</span>;

    return <span>{sf.value}</span>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading submissions...
      </div>
    );
  }
  // Approve
const handleApprove = async (approvalStepId: number, comment: string = "") => {
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:8000/api/approval-step/approve",
      {
        approval_step_id: approvalStepId,
        comment,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSuccess(response.data.message);
    // Optionally reload UI/state here (e.g. refetch data or mutate cache)
  } catch (err: any) {
    setError(err.response?.data?.error || "Failed to approve.");
  } finally {
    setLoading(false);
  }
};

const handleReject = async (approvalStepId: number, comment: string = "") => {
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:8000/api/approval-step/reject",
      {
        approval_step_id: approvalStepId,
        comment,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSuccess(response.data.message);
    // Optionally reload UI/state here
  } catch (err: any) {
    setError(err.response?.data?.error || "Failed to reject.");
  } finally {
    setLoading(false);
  }
};




  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">📋 Submitted Forms</h1>

        <div className="space-y-6">
          {submissions.map((submission) => (
            <div key={submission.id} className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{submission.form?.title || "Untitled"}</h2>
                  <p className="text-sm text-gray-500">
                    Submitted by <strong>{submission.user?.name || "Unknown"}</strong> on{" "}
                    {new Date(submission.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => openDetails(submission)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Eye className="w-4 h-4" /> Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Details Dialog */}
        <Dialog
          open={!!selectedSubmission}
          onClose={() => {
            setSelectedSubmission(null);
            setApprovalProcess(null);
          }}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl border">
                <Dialog.Title className="text-xl font-bold text-gray-800 mb-4">
                  {selectedSubmission?.form?.title} — Details
                </Dialog.Title>

                {selectedSubmission && (
                  <div className="space-y-6 text-sm text-gray-800">
                    <div>
                      <strong>Description:</strong> {selectedSubmission.form?.description || "-"}
                    </div>

                    <div>
                      <strong>Submitted Values:</strong>
                      {selectedSubmission.fields?.length ? (
                        <ul className="mt-2 space-y-4">
                          {selectedSubmission.fields.map((field) => (
                            <li key={field.id} className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                              {field.field ? (
                                <div className="font-medium text-gray-700">
                                  {field.field.label}: {renderFieldValue(field)}
                                </div>
                              ) : (
                                <div className="text-red-600 italic">⚠️ This field was not well defined in the form.</div>
                              )}

                              {field.children && field.children.length > 0 ? (
                                <table className="w-full text-sm border mt-3">
                                  <thead className="bg-gray-200">
                                    <tr>
                                      {[...new Set(field.children.map((c) => c.label))].map((label) => (
                                        <th key={label} className="px-3 py-2 text-left border">
                                          {label}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(() => {
                                      const labels = [...new Set(field.children.map((c) => c.label))];
                                      const groupSize = labels.length;
                                      const rows = [];
                                      for (let i = 0; i < field.children.length; i += groupSize) {
                                        rows.push(field.children.slice(i, i + groupSize));
                                      }
                                      return rows.map((row, idx) => (
                                        <tr key={idx} className="border-t">
                                          {row.map((cell, i) => (
                                            <td key={i} className="px-3 py-2 border">
                                              {cell.value}
                                            </td>
                                          ))}
                                        </tr>
                                      ));
                                    })()}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-gray-500 italic">No child values submitted.</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <em className="text-gray-500 block mt-1">No fields submitted.</em>
                      )}
                    </div>

                    <div>
                      <strong>Approval Process:</strong>
                      {loadingApproval ? (
                        <p>Loading approval process...</p>
                      ) : approvalProcess && approvalProcess.steps?.length ? (
                        <ul className="mt-2 space-y-2">
                          {approvalProcess.steps.map((step) => {
                            const statusIcon =
                              step.status === "approved" ? (
                                <CheckCircle className="w-4 h-4 text-green-500 inline-block mr-1" />
                              ) : step.status === "rejected" ? (
                                <XCircle className="w-4 h-4 text-red-500 inline-block mr-1" />
                              ) : (
                                <Clock className="w-4 h-4 text-yellow-500 inline-block mr-1" />
                              );

                            return (
                              <li key={step.id} className="flex justify-between items-center gap-4">
                                <span className="flex items-center gap-2">
                                  {statusIcon}
                                  Step {step.step_number}:{" "}
                                  <strong>{step.job_title?.name || "Unknown"}</strong> ({step.job_title?.name || "N/A"})
                                </span>

                                <div className="flex flex-col items-end max-w-xs text-right">
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${step.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : step.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                      }`}
                                  >
                                    {step.status}
                                  </span>

                                  {step.status === "pending" && loggedUser && step.job_title?.name === loggedUser.job_title?.name && (() => {
                                    // find precedent step:
                                    const precedentStep = approvalProcess.steps.find(s => s.step_number === step.step_number - 1);

                                    // check if precedent step is approved:
                                    const precedentApproved = precedentStep ? precedentStep.status === "approved" : true; // if no precedent step, consider true

                                    return (
                                      <>
                                        <button
                                          onClick={() => handleApprove(step.id)}
                                          className={`mt-2 px-4 py-2 rounded ${precedentApproved
                                            ? "bg-green-600 text-white hover:bg-green-700"
                                            : "bg-gray-400 text-gray-700 cursor-not-allowed"
                                            }`}
                                          disabled={!precedentApproved}
                                        >
                                          Approve
                                        </button>

                                        <button
                                          onClick={() => handleReject(step.id)}
                                          className={`px-4 py-2 rounded ${precedentApproved
                                              ? "bg-red-600 text-white hover:bg-red-700"
                                              : "bg-gray-400 text-gray-700 cursor-not-allowed"
                                            }`}
                                          disabled={!precedentApproved}
                                        >
                                          Reject
                                        </button>

                                        <p className="mt-2 text-xs text-gray-600">
                                          Can approve: <strong>{loggedUser.name}</strong>{" "}
                                          <strong>Job Title: {loggedUser.job_title?.name}</strong>
                                        </p>
                                      </>
                                    );
                                  })()}
                                </div>
                              </li>



                            );
                          })}
                        </ul>
                      ) : (
                        <em className="text-gray-500 block mt-1">No approval process defined.</em>
                      )}
                    </div>


                  </div>
                )}
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
