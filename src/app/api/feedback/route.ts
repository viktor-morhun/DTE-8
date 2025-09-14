// app/api/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google, sheets_v4 } from "googleapis";
import type { JWTInput } from "google-auth-library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --------- helpers ---------
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

// Экранируем имя листа и оборачиваем в одинарные кавычки для A1-нотации
function quoteA1Sheet(sheetName: string): string {
  const safe = sheetName.replace(/'/g, "''");
  return `'${safe}'`;
}

type Body = {
  rating: number;
  feedback: string;
  meta?: Record<string, unknown>;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isBody(v: unknown): v is Body {
  if (!isRecord(v)) return false;
  const { rating, feedback, meta } = v as Record<string, unknown>;
  const ratingOk = typeof rating === "number" && Number.isFinite(rating);
  const feedbackOk = typeof feedback === "string";
  const metaOk =
    typeof meta === "undefined" || (isRecord(meta) && meta !== null);
  return ratingOk && feedbackOk && metaOk;
}

// Клиент Sheets с JSON ключом в base64 (GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64)
function getSheetsClient(): sheets_v4.Sheets {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64;
  if (!b64) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64");
  }
  const raw = Buffer.from(b64, "base64").toString("utf8");

  let credentials: JWTInput;
  try {
    const parsed = JSON.parse(raw) as unknown;
    // легкая проверка на нужные поля (client_email/private_key) — не строго, но помогает отлавливать ошибки
    if (
      !isRecord(parsed) ||
      typeof parsed.client_email !== "string" ||
      typeof parsed.private_key !== "string"
    ) {
      throw new Error("Invalid service account JSON structure");
    }
    credentials = parsed as JWTInput;
  } catch (e) {
    throw new Error(
      `Failed to parse GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64: ${getErrorMessage(
        e
      )}`
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

// --------- route ---------
export async function POST(req: NextRequest) {
  try {
    const payloadUnknown: unknown = await req.json();

    if (!isBody(payloadUnknown)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { rating, feedback, meta } = payloadUnknown;

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Feedback";
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Missing GOOGLE_SHEETS_SPREADSHEET_ID" },
        { status: 500 }
      );
    }

    const sheets = getSheetsClient();

    // Проверим, что лист существует, иначе создадим
    const metaRes = await sheets.spreadsheets.get({ spreadsheetId });
    const exists =
      metaRes.data.sheets?.some(
        (s) => s.properties?.title === sheetName
      ) ?? false;

    if (!exists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: sheetName } } }],
        },
      });
    }

    // Данные строки
    const iso = new Date().toISOString();
    const userAgent = req.headers.get("user-agent") ?? "";
    const row: (string | number)[] = [
      iso,
      rating,
      feedback,
      JSON.stringify(meta ?? {}),
      userAgent,
    ];

    const range = `${quoteA1Sheet(sheetName)}!A:E`;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = getErrorMessage(err);

    console.error("Sheets append error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}