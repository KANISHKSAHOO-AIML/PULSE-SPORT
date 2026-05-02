import { NextRequest, NextResponse } from "next/server";

/**
 * Image proxy to bypass CORS/referrer restrictions on external sports images.
 * Usage: /api/image-proxy?url=<encoded_image_url>
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const decoded = decodeURIComponent(url);
    
    // Only allow proxying from known safe domains
    const allowed = [
      "espncdn.com",
      "espn.com",
      "media.espn.com",
      "img1.hscicdn.com",
      "p.imgci.com",
      "images.unsplash.com",
      "espncricinfo.com",
      "cricinfo.com",
      "wisden.com",
      "icc-cricket.com",
    ];

    const parsedUrl = new URL(decoded);
    const hostname = parsedUrl.hostname;
    if (!allowed.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
      return new NextResponse("Domain not allowed", { status: 403 });
    }

    // Use multiple referer strategies to maximize success
    const referers = [
      "https://www.espn.com/",
      "https://www.espncricinfo.com/",
      "https://www.google.com/",
    ];

    let lastError: any = null;

    for (const referer of referers) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(decoded, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            Accept: "image/webp,image/avif,image/jxl,image/heic,image/heic-sequence,image/heif,image/heif-sequence,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
            Referer: referer,
            "Accept-Language": "en-US,en;q=0.9",
            "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "image",
            "sec-fetch-mode": "no-cors",
            "sec-fetch-site": "cross-site",
          },
          signal: controller.signal,
          redirect: "follow",
        });

        clearTimeout(timeout);

        if (response.ok) {
          const contentType = response.headers.get("content-type") || "image/jpeg";
          const buffer = await response.arrayBuffer();

          if (buffer.byteLength < 100) {
            // Too small — likely an error page, not an image
            continue;
          }

          return new NextResponse(Buffer.from(buffer), {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=86400, s-maxage=86400",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
        lastError = `HTTP ${response.status}`;
      } catch (err: any) {
        lastError = err?.message || "Fetch failed";
      }
    }

    console.error(`Image proxy failed for all referers: ${decoded}, last error: ${lastError}`);
    return new NextResponse("Failed to fetch image", { status: 502 });
  } catch (err) {
    console.error("Image proxy error:", err);
    return new NextResponse("Proxy error", { status: 500 });
  }
}
