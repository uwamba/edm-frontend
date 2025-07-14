import { useEffect, useState } from "react";
import axios from "axios";

interface Submission {
  id: number;
  form_id: number;
  user_id: number;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export default function SubmissionDetails({ id }: { id: number }) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/submissions/${id}`);
        setSubmission(res.data);
      } catch (err) {
        console.error("Failed to load submission details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading details...</p>;

  if (!submission) return <p className="text-red-600">Submission not found.</p>;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded border">
      <h3 className="font-semibold mb-2">Details for Submission #{submission.id}</h3>
      <p><strong>Form ID:</strong> {submission.form_id}</p>
      <p><strong>User ID:</strong> {submission.user_id}</p>
      <p><strong>Submitted At:</strong> {new Date(submission.created_at).toLocaleString()}</p>
      <h4 className="mt-3 font-semibold">Data:</h4>
      <pre className="bg-white p-2 rounded text-sm overflow-auto max-h-60">
        {JSON.stringify(submission.data, null, 2)}
      </pre>
    </div>
  );
}
