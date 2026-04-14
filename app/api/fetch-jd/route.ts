import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "Provide a valid http(s) URL." }, { status: 400 });
    }

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 10_000);

    const res = await fetch(url, {
      signal: ac.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (InterviewSim/1.0) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    }).finally(() => clearTimeout(timer));

    if (!res.ok) {
      return NextResponse.json(
        { error: `Fetch failed (${res.status}). Paste the text instead.` },
        { status: 502 },
      );
    }

    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    const CAP = 1_000_000;
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > CAP) break;
        chunks.push(value);
      }
    }
    const raw = new TextDecoder("utf-8", { fatal: false }).decode(
      new Uint8Array(chunks.flatMap((c) => Array.from(c))),
    );

    const text = stripHtml(raw).slice(0, 6000);

    if (text.length < 200) {
      return NextResponse.json(
        {
          error:
            "Couldn't extract enough text from that URL (likely JS-rendered or auth-walled). Paste the job description text instead.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
