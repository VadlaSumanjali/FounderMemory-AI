import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserContext } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { retainMemory } from "@/lib/hindsight";

// Helper to chunk text into reasonably sized blocks
function chunkText(text: string, size = 1500): string[] {
  const chunks: string[] = [];
  let index = 0;
  while (index < text.length) {
    chunks.push(text.substring(index, index + size));
    index += size;
  }
  return chunks;
}

export async function GET() {
  try {
    const { startupId } = await getOrCreateUserContext();
    const documents = await prisma.document.findMany({
      where: { startupId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        isProcessed: true,
        createdAt: true,
      },
    });
    return NextResponse.json(documents);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { startupId } = await getOrCreateUserContext();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const name = file.name;
    const extension = name.split(".").pop()?.toLowerCase() || "";
    let extractedText = "";

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract text based on file format
    if (extension === "txt" || extension === "md") {
      extractedText = await file.text();
    } else if (extension === "pdf") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text || "";
      } catch (pdfError) {
        console.error("PDF parse failure:", pdfError);
        return NextResponse.json({ error: "Failed to parse PDF document content." }, { status: 422 });
      }
    } else if (extension === "docx") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mammoth = require("mammoth");
        const docxResult = await mammoth.extractRawText({ buffer });
        extractedText = docxResult.value || "";
      } catch (docxError) {
        console.error("Word document parse failure:", docxError);
        return NextResponse.json({ error: "Failed to parse Word document content." }, { status: 422 });
      }
    } else {
      return NextResponse.json({ error: "Unsupported file extension type." }, { status: 415 });
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "Document is empty or text could not be extracted." }, { status: 400 });
    }

    // 2. Persist Document metadata & full text to database
    const documentRecord = await prisma.document.create({
      data: {
        startupId,
        name,
        type: extension,
        content: extractedText,
        isProcessed: false,
      },
    });

    // 3. Chunk text and retain in Hindsight Vector Store in the background
    const chunks = chunkText(extractedText);
    const tagSafeName = name.toLowerCase().replace(/[^a-z0-9]/g, "-");

    // Perform Hindsight indexing
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      await retainMemory({
        startupId,
        content: `Document: ${name} (Chunk ${i + 1}/${chunks.length}):\n${chunk}`,
        category: "Document",
        tags: ["document", tagSafeName],
        source: "document",
        importance: 4,
        confidence: 1.0,
      });
    }

    // Mark as processed
    await prisma.document.update({
      where: { id: documentRecord.id },
      data: { isProcessed: true },
    });

    return NextResponse.json({
      id: documentRecord.id,
      name: documentRecord.name,
      type: documentRecord.type,
      chunks: chunks.length,
      success: true,
    });
  } catch (error) {
    console.error("POST /api/documents error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
