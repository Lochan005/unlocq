import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { gunzipSync } from "zlib";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data", "ifsc");
    const ifscPath = path.join(dataDir, "IFSC.json.gz");

    const result: {
      fileExists: boolean;
      fileSize?: number;
      canDecompress?: boolean;
      decompressedSize?: number;
      canParseJSON?: boolean;
      recordCount?: number;
      error?: string;
      sampleRecord?: unknown;
      filePath?: string;
    } = {
      fileExists: false,
      filePath: ifscPath,
    };

    try {
      if (!fs.existsSync(ifscPath)) {
        return NextResponse.json({
          ...result,
          error: `File not found at: ${ifscPath}`,
        }, { status: 404 });
      }

      result.fileExists = true;
      const stats = fs.statSync(ifscPath);
      result.fileSize = stats.size;

      try {
        const buffer = fs.readFileSync(ifscPath);
        result.canDecompress = false;
        result.decompressedSize = 0;
        
        try {
          const raw = gunzipSync(buffer).toString("utf-8");
          result.canDecompress = true;
          result.decompressedSize = raw.length;
          
          if (raw.length > 50_000_000) {
            result.canParseJSON = false;
            result.error = `File too large to fully parse in test (${Math.round(raw.length / 1024 / 1024)} MB). Checking structure...`;
            const firstChar = raw.trim()[0];
            const lastChar = raw.trim()[raw.trim().length - 1];
            result.sampleRecord = {
              startsWith: firstChar,
              endsWith: lastChar,
              looksLikeArray: firstChar === "[" && lastChar === "]",
            };
            result.recordCount = -1;
          } else {
            try {
              const data = JSON.parse(raw);
              result.canParseJSON = true;
              const arr = Array.isArray(data) ? data : [];
              result.recordCount = arr.length;
              if (arr.length > 0) {
                result.sampleRecord = {
                  ifsc: (arr[0] as any)?.ifsc,
                  bank: (arr[0] as any)?.bank,
                  branch: (arr[0] as any)?.branch,
                };
              }
            } catch (parseErr) {
              result.error = `JSON parse error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`;
              result.error += `\nFirst 200 chars: ${raw.substring(0, 200)}`;
            }
          }
        } catch (decompressErr) {
          result.error = `Decompression error: ${decompressErr instanceof Error ? decompressErr.message : String(decompressErr)}`;
          if (decompressErr instanceof Error && decompressErr.stack) {
            result.error += `\nStack: ${decompressErr.stack.substring(0, 500)}`;
          }
        }
      } catch (readErr) {
        result.error = `File read error: ${readErr instanceof Error ? readErr.message : String(readErr)}`;
      }
    } catch (err) {
      result.error = `File read error: ${err instanceof Error ? err.message : String(err)}`;
      if (err instanceof Error && err.stack) {
        result.error += `\nStack: ${err.stack}`;
      }
    }

    return NextResponse.json(result);
  } catch (outerErr) {
    return NextResponse.json({
      error: `Unexpected error: ${outerErr instanceof Error ? outerErr.message : String(outerErr)}`,
      stack: outerErr instanceof Error ? outerErr.stack : undefined,
    }, { status: 500 });
  }
}
