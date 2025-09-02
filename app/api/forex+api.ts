import type { ForexRate, ApiResponse } from '@/types/forex'
import { FOREX_SERVICE_CONFIG } from '@/constants/Config'

// Forex service configuration
const FOREX_SERVICE_URL = FOREX_SERVICE_CONFIG.BASE_URL
const API_TOKEN = FOREX_SERVICE_CONFIG.API_TOKEN

// Forex service response interface
interface ForexServiceResponse {
  from: string
  to: string
  bid: number
  ask: number
  price: number
  time_stamp: string
}

async function fetchFromForexService(pair: string): Promise<ForexRate> {
  // Convert pair format: USD/JPY -> USDJPY
  const pairFormatted = pair.replace('/', '')
  
  const response = await fetch(
    `${FOREX_SERVICE_URL}/rates?pair=${pairFormatted}`,
    {
      headers: {
        'token': API_TOKEN || ''
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Forex service error: ${response.status}`)
  }

  const data: ForexServiceResponse[] = await response.json()
  
  if (!data || data.length === 0) {
    throw new Error('No data received from forex service')
  }

  const rate = data[0]
  
  return {
    from: rate.from,
    to: rate.to,
    bid: parseFloat(rate.bid.toFixed(5)),
    ask: parseFloat(rate.ask.toFixed(5)),
    price: parseFloat(rate.price.toFixed(5)),
    timestamp: new Date(rate.time_stamp).getTime()
  }
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const pair = url.searchParams.get('pair') || 'USD/JPY'
  const isStream = url.searchParams.get('stream') === 'true'

  // Validate the pair format
  if (!pair.includes('/')) {
    const response: ApiResponse<null> = {
      success: false,
      error: `Invalid currency pair format: ${pair}. Use format like USD/JPY`
    }
    return Response.json(response, { status: 400 })
  }

  try {
    if (isStream) {
      // For streaming, we'll use the forex service's streaming endpoint
      // but still need to handle it as server-sent events for the client
      const encoder = new TextEncoder()
      
      const stream = new ReadableStream({
        start(controller) {
          let fetchController: AbortController | null = null
          
          const startStreaming = async () => {
            fetchController = new AbortController()
            
            try {
              const pairFormatted = pair.replace('/', '')
              const response = await fetch(
                `${FOREX_SERVICE_URL}/streaming/rates?pair=${pairFormatted}`,
                {
                  headers: {
                    'token': API_TOKEN || ''
                  },
                  signal: fetchController.signal
                }
              )

              if (!response.ok) {
                throw new Error(`Forex service error: ${response.status}`)
              }

              const reader = response.body?.getReader()
              if (!reader) {
                throw new Error('No response body')
              }

              const decoder = new TextDecoder()
              let buffer = ''

              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                
                // Process complete JSON arrays
                let startIndex = 0
                let bracketCount = 0
                let inArray = false
                
                for (let i = 0; i < buffer.length; i++) {
                  if (buffer[i] === '[') {
                    if (!inArray) {
                      startIndex = i
                      inArray = true
                    }
                    bracketCount++
                  } else if (buffer[i] === ']') {
                    bracketCount--
                    if (bracketCount === 0 && inArray) {
                      const jsonStr = buffer.substring(startIndex, i + 1)
                      try {
                        const rates: ForexServiceResponse[] = JSON.parse(jsonStr)
                        // Find the rate for our specific pair
                        const targetRate = rates.find(r => `${r.from}/${r.to}` === pair)
                        
                        if (targetRate) {
                          const forexRate: ForexRate = {
                            from: targetRate.from,
                            to: targetRate.to,
                            bid: parseFloat(targetRate.bid.toFixed(5)),
                            ask: parseFloat(targetRate.ask.toFixed(5)),
                            price: parseFloat(targetRate.price.toFixed(5)),
                            timestamp: new Date(targetRate.time_stamp).getTime()
                          }
                          
                          const apiResponse: ApiResponse<ForexRate> = {
                            success: true,
                            data: forexRate
                          }
                          
                          const data = `data: ${JSON.stringify(apiResponse)}\n\n`
                          controller.enqueue(encoder.encode(data))
                        }
                      } catch (parseError) {
                        console.error('JSON parse error:', parseError)
                      }
                      
                      buffer = buffer.substring(i + 1)
                      inArray = false
                      i = -1 // Reset loop
                    }
                  }
                }
              }
            } catch (error) {
              if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Streaming error:', error)
                const errorResponse: ApiResponse<null> = {
                  success: false,
                  error: error.message
                }
                const data = `data: ${JSON.stringify(errorResponse)}\n\n`
                controller.enqueue(encoder.encode(data))
              }
            }
          }

          startStreaming()

          // Cleanup function
          return () => {
            if (fetchController) {
              fetchController.abort()
            }
          }
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
      // Single rate request - use the regular rates endpoint
      const rate = await fetchFromForexService(pair)
      const response: ApiResponse<ForexRate> = {
        success: true,
        data: rate
      }
      return Response.json(response)
    }
  } catch (error) {
    console.error('API Error:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    return Response.json(response, { status: 500 })
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { pair } = body

    if (!pair || !pair.includes('/')) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid currency pair format. Use format like USD/JPY'
      }
      return Response.json(response, { status: 400 })
    }

    const rate = await fetchFromForexService(pair)
    const response: ApiResponse<ForexRate> = {
      success: true,
      data: rate
    }

    return Response.json(response)
  } catch (err) {
    console.error('Error in POST request:', err)
    const response: ApiResponse<null> = {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
    return Response.json(response, { status: 500 })
  }
}
