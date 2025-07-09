import type { NextApiRequest, NextApiResponse } from 'next';
export default function handler(eq: NextApiRequest,
  res: NextApiResponse) {
  res.status(200).json([
    {
      id: "1",
      element: "Header",
      text: "Employee Feedback Form",
      static: true
    },
    {
      id: "2",
      element: "TextInput",
      label: "Full Name",
      required: true
    },
    {
      id: "3",
      element: "RadioButtons",
      label: "Rate your experience",
      options: [
        { value: "excellent", text: "Excellent" },
        { value: "good", text: "Good" },
        { value: "fair", text: "Fair" },
        { value: "poor", text: "Poor" }
      ],
      required: true
    },
    {
      id: "4",
      element: "TextArea",
      label: "Additional Comments"
    }
  ]);
}
