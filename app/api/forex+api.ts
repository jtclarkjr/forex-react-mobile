import type { ForexRate, ApiResponse } from '../../types/forex'
import { BASE_RATES } from '../../constants/Forex'

function generateForexRate(pair: string, baseRate: number): ForexRate {
  const [from, to] = pair.split('/')

  // Add some random volatility (-1% to +1%)
  const volatility = (Math.random() - 0.5) * 0.02
  const currentRate = baseRate * (1 + volatility)

  // Calculate bid/ask spread (typically 2-5 pips for major pairs)
  const spread = currentRate * 0.0002 // 0.02% spread
  const bid = currentRate - spread / 2
  const ask = currentRate + spread / 2

  return {
    from,
    to,
    bid: parseFloat(bid.toFixed(5)),
    ask: parseFloat(ask.toFixed(5)),
    price: parseFloat(currentRate.toFixed(5)),
    timestamp: Date.now()
  }
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const pair = url.searchParams.get('pair') || 'USD/JPY'
  const isStream = url.searchParams.get('stream') === 'true'

  if (!BASE_RATES[pair]) {
    const response: ApiResponse<null> = {
      success: false,
      error: `Unsupported currency pair: ${pair}`
    }
    return Response.json(response, { status: 400 })
  }

  if (isStream) {
    // Server-Sent Events for real-time streaming
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      start(controller) {
        const sendRate = () => {
          const rate = generateForexRate(pair, BASE_RATES[pair])
          const response: ApiResponse<ForexRate> = {
            success: true,
            data: rate
          }

          const data = `data: ${JSON.stringify(response)}\\n\\n`
          controller.enqueue(encoder.encode(data))
        }

        // Send initial rate immediately
        sendRate()

        // Send updates every 2 seconds
        const interval = setInterval(sendRate, 2000)

        // Clean up on close
        const cleanup = () => {
          clearInterval(interval)
          controller.close()
        }

        // Set up cleanup (this is a simplified approach)
        setTimeout(cleanup, 300000) // Close after 5 minutes
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })
  } else {
    // Single rate request
    const rate = generateForexRate(pair, BASE_RATES[pair])

    const response: ApiResponse<ForexRate> = {
      success: true,
      data: rate
    }

    return Response.json(response)
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { pair } = body

    if (!pair || !BASE_RATES[pair]) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid or unsupported currency pair'
      }
      return Response.json(response, { status: 400 })
    }

    const rate = generateForexRate(pair, BASE_RATES[pair])
    const response: ApiResponse<ForexRate> = {
      success: true,
      data: rate
    }

    return Response.json(response)
  } catch (err) {
    console.error('Error parsing request body:', err)
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid request body'
    }
    return Response.json(response, { status: 400 })
  }
}
