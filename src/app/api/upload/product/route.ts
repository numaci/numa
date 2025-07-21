import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable-serverless";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(req: NextRequest) {
  // 1. On écrit le buffer dans un fichier temporaire
  const buffer = Buffer.from(await req.arrayBuffer());
  const tmpFile = path.join(os.tmpdir(), uuidv4() + ".tmp");
  fs.writeFileSync(tmpFile, buffer);

  // 2. On crée un faux req Node.js pour formidable-serverless
  const form = new formidable.IncomingForm({ multiples: true, uploadDir, keepExtensions: true });
  const headers = Object.fromEntries(req.headers);

  // 3. On lit le fichier temporaire comme un stream
  const fakeReq = fs.createReadStream(tmpFile);
  fakeReq.headers = headers;

  return new Promise((resolve, reject) => {
    form.parse(fakeReq, (err, fields, files) => {
      fs.unlinkSync(tmpFile); // Nettoyage du fichier temporaire
      if (err) {
        return resolve(NextResponse.json({ error: "Erreur upload" }, { status: 500 }));
      }
      const uploaded = [];
      let fileArray = [];
      if (files.file) {
        fileArray = Array.isArray(files.file) ? files.file : [files.file];
      }
      for (const file of fileArray) {
        if (!file || !file.filepath) continue; // Correction ici
        const ext = path.extname(file.originalFilename || file.newFilename || "");
        const newName = uuidv4() + ext;
        const dest = path.join(uploadDir, newName);
        fs.renameSync(file.filepath, dest);
        uploaded.push(`/uploads/products/${newName}`);
      }
      resolve(NextResponse.json({ urls: uploaded }));
    });
  });
} 