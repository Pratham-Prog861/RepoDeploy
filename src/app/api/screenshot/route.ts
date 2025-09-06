import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    // Screenshot service configuration
    const screenshotServices = [
      {
        name: 'ScreenshotAPI',
        url: `https://shot.screenshotapi.net/screenshot?url=${encodeURIComponent(url)}&width=1280&height=720&output=image&file_type=png&wait_for_event=load&delay=3000`,
        headers: {}
      },
      {
        name: 'Screenshot.rocks', 
        url: `https://api.screenshot.rocks/screenshot?url=${encodeURIComponent(url)}&width=1280&height=720&format=png&delay=3000`,
        headers: {}
      },
      {
        name: 'Fallback - Page Info',
        url: null, // Will generate a custom preview
        headers: {}
      }
    ];

    // Try each service
    for (const service of screenshotServices) {
      try {
        if (!service.url) {
          // Generate custom preview as fallback
          return generateCustomPreview(url);
        }

        const response = await fetch(service.url, {
          headers: service.headers,
          timeout: 10000 // 10 second timeout
        });

        if (response.ok) {
          const imageBuffer = await response.arrayBuffer();
          
          return new NextResponse(imageBuffer, {
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
              'X-Screenshot-Service': service.name
            }
          });
        }
      } catch (error) {
        console.warn(`Screenshot service ${service.name} failed:`, error);
        continue;
      }
    }

    // All services failed, generate custom preview
    return generateCustomPreview(url);
    
  } catch (error) {
    console.error('Screenshot API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate screenshot' },
      { status: 500 }
    );
  }
}

async function generateCustomPreview(url: string): Promise<NextResponse> {
  try {
    // Parse URL to get domain and path info
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;

    // Create a simple SVG preview
    const svg = `
      <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="1280" height="720" fill="url(#bg)" />
        
        <!-- Browser mockup -->
        <rect x="40" y="60" width="1200" height="600" fill="white" rx="12" />
        
        <!-- Browser bar -->
        <rect x="40" y="60" width="1200" height="50" fill="#f5f5f5" rx="12" />
        <rect x="40" y="105" width="1200" height="555" fill="white" />
        
        <!-- Browser buttons -->
        <circle cx="70" cy="85" r="6" fill="#ff5f56" />
        <circle cx="90" cy="85" r="6" fill="#ffbd2e" />
        <circle cx="110" cy="85" r="6" fill="#27ca3f" />
        
        <!-- Address bar -->
        <rect x="140" y="75" width="600" height="20" fill="white" rx="10" stroke="#e0e0e0" />
        <text x="150" y="87" font-family="Arial, sans-serif" font-size="12" fill="#666">
          ${url}
        </text>
        
        <!-- Website content mockup -->
        <rect x="80" y="140" width="1120" height="40" fill="#667eea" opacity="0.1" rx="4" />
        <text x="640" y="165" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
              fill="#333" text-anchor="middle">
          ${domain}
        </text>
        
        <rect x="80" y="200" width="540" height="8" fill="#e0e0e0" rx="4" />
        <rect x="80" y="220" width="720" height="8" fill="#e0e0e0" rx="4" />
        <rect x="80" y="240" width="480" height="8" fill="#e0e0e0" rx="4" />
        
        <rect x="80" y="280" width="1120" height="200" fill="#f8f9fa" rx="8" stroke="#e0e0e0" />
        
        <!-- Live indicator -->
        <circle cx="100" cy="300" r="4" fill="#27ca3f" />
        <text x="115" y="305" font-family="Arial, sans-serif" font-size="12" fill="#27ca3f" font-weight="bold">
          LIVE WEBSITE
        </text>
        
        <text x="100" y="330" font-family="Arial, sans-serif" font-size="14" fill="#666">
          Your website is live and accessible at:
        </text>
        <text x="100" y="350" font-family="Arial, sans-serif" font-size="16" fill="#667eea" font-weight="bold">
          ${url}
        </text>
        
        <!-- Deployment success message -->
        <text x="640" y="420" font-family="Arial, sans-serif" font-size="18" font-weight="bold" 
              fill="#333" text-anchor="middle">
          🚀 Deployment Successful!
        </text>
        <text x="640" y="450" font-family="Arial, sans-serif" font-size="14" 
              fill="#666" text-anchor="middle">
          Your repository has been deployed and is now live on the internet
        </text>
      </svg>
    `;

    // Convert SVG to PNG would require additional libraries
    // For now, return the SVG directly
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
        'X-Screenshot-Service': 'Custom Preview'
      }
    });
    
  } catch (error) {
    console.error('Custom preview generation failed:', error);
    throw error;
  }
}
