import type { NextApiRequest, NextApiResponse } from 'next';
export default function handler(req: NextApiRequest,
  res: NextApiResponse) {
  if (req.method === "POST") {
    console.log("✅ Saved Form Data:", req.body);
    return res.status(200).json({ message: "Form saved successfully!" });
  }

  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
