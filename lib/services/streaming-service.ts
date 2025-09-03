import type { ForexRate, ApiResponse, ForexServiceResponse } from '@/types/forex'
import { FOREX_SERVICE_CONFIG } from '@/constants/Config'
import { formatForexResponse, formatPairForApi } from '@/lib/utils/forex-utils'

const FOREX_SERVICE_URL = FOREX_SERVICE_CONFIG.BASE_URL
const API_TOKEN = FOREX_SERVICE_CONFIG.API_TOKEN

// Parses streaming JSON data and sends formatted forex rates to client
const processStreamBuffer = (
  buffer: string,
  pair: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
): string => {
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
          const targetRate = rates.find(r => `${r.from}/${r.to}` === pair)
          
          if (targetRate) {
            // Validate targetRate has required properties before formatting
            if (typeof targetRate.bid !== 'number' ||
                typeof targetRate.ask !== 'number' ||
                typeof targetRate.price !== 'number' ||
                !targetRate.from || 
                !targetRate.to ||
                !targetRate.time_stamp) {
              console.error('Invalid rate data from streaming service:', targetRate)
              return
            }
            
            const forexRate = formatForexResponse(targetRate)
            const apiResponse: ApiResponse<ForexRate> = {
              success: true,
              data: forexRate
            }
            
            const data = `data: ${JSON.stringify(apiResponse)}\\n\\n`
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
  
  return buffer
}

// Handles the streaming fetch request and processes incoming data
const handleStreamingResponse = async (
  pair: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  fetchController: AbortController
): Promise<void> => {
  const pairFormatted = formatPairForApi(pair)
  const response = await fetch(
    `${FOREX_SERVICE_URL}/streaming/rates?pair=${pairFormatted}`,
    {
      headers: { 'token': API_TOKEN || '' },
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
    buffer = processStreamBuffer(buffer, pair, controller, encoder)
  }
}

// Creates a Server-Sent Events response for streaming forex data
export const createStreamingResponse = (pair: string): Response => {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      let fetchController: AbortController | null = null
      
      const startStreaming = async () => {
        fetchController = new AbortController()
        
        try {
          await handleStreamingResponse(pair, controller, encoder, fetchController)
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Streaming error:', error)
            const errorResponse: ApiResponse<null> = {
              success: false,
              error: error.message
            }
            const data = `data: ${JSON.stringify(errorResponse)}\\n\\n`
            controller.enqueue(encoder.encode(data))
          }
        }
      }

      startStreaming()

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
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}
