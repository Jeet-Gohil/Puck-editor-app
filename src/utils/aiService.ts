/**
 * AI Service - Handles communication with external AI API
 */
import { AIAPIConfig, AIGenerationRequest, SSEServerRequest } from '@/types';
import { AI_CONFIG, AI_PROMPTS } from '@/constants';

/**
 * AI Service class to handle external AI API communication
 */
export class AIService {
  private config: AIAPIConfig;

  constructor(config: Partial<AIAPIConfig> = {}) {
    this.config = {
      endpoint: `http://localhost:8000/generate`,
      streamEndpoint: `http://localhost:8000/stream`,
      ...config,
    };
  }

  /**
   * Gets business description from environment or uses default
   */
  private getBusinessDescription(): string {
    return process.env.BUSINESS_DESCRIPTION || AI_CONFIG.DEFAULT_BUSINESS_DESCRIPTION;
  }

  /**
   * Validates the AI service configuration
   */
  private validateConfig(): void {
    if (!this.config.endpoint) {
      throw new Error('AI API endpoint is not configured. Please set AI_API_ENDPOINT environment variable.');
    }

    console.log(`AI Service configured with endpoint: ${this.config.endpoint}`);
  }

  /**
   * Generates a prompt based on field type and context
   */
  private generatePrompt(fieldType: string, currentValue?: string, context?: string): string {
    const basePrompt = AI_PROMPTS[fieldType as keyof typeof AI_PROMPTS] || AI_PROMPTS.text;
    
    let prompt = basePrompt;
    
    if (currentValue) {
      prompt += ` Current value: "${currentValue}". Improve or replace this content.`;
    }
    
    if (context) {
      prompt += ` Context: ${context}`;
    }
    
    return prompt;
  }

  /**
   * Makes a request to the Python SSE server with your custom format
   */
  private async makeAIRequest(elementId: string, fieldName: string, prompt: string): Promise<string> {
    this.validateConfig();

    // Request body in your SSE server's expected format
    const requestBody: SSEServerRequest = {
      elementid: elementId,
      field: fieldName,
      business_description: this.getBusinessDescription(),
      prompt: prompt,
    };

    console.log('🚀 Starting AI request for:', elementId, fieldName);
    console.log('📝 Request body:', requestBody);
    console.log('🎯 Looking for exact element ID:', elementId);

    // Step 1: Submit the job
    console.log('📤 Step 1: Submitting job to /generate');
    const jobResponse = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!jobResponse.ok) {
      throw new Error(`Job submission failed: ${jobResponse.status} ${jobResponse.statusText}`);
    }

    const jobResult = await jobResponse.json();
    console.log('✅ Job submitted successfully:', jobResult);

    if (!jobResult.ok || !jobResult.queued) {
      throw new Error(`Job submission failed: ${JSON.stringify(jobResult)}`);
    }

    // Step 2: Connect to stream and wait for result
    const streamEndpoint = this.config.streamEndpoint || this.config.endpoint.replace('/generate', '/stream');
    console.log('📡 Step 2: Connecting to SSE stream:', streamEndpoint);
    console.log('🔗 Creating new SSE connection for element:', elementId);

    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        console.log('⏰ Request timeout for element:', elementId);
        controller.abort();
        reject(new Error(`Request timeout after 45 seconds for element: ${elementId}`));
      }, 45000); // 45 second timeout

      let hasReceivedResult = false;

      // Use fetch with streaming for server-side compatibility
      fetch(streamEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      })
      .then(response => {
        console.log('📡 SSE Response received:', response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`SSE request failed: ${response.status} ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('No response body received from SSE server');
        }

        console.log('✅ SSE stream connected, starting to read...');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const readStream = async () => {
          try {
            console.log('📖 Starting to read SSE stream for element:', elementId);

            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                console.log('📋 SSE stream ended for element:', elementId);
                if (!hasReceivedResult) {
                  reject(new Error('Stream ended without receiving result'));
                }
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              console.log('📦 Raw SSE chunk:', chunk);
              const lines = chunk.split('\n');

              for (const line of lines) {
                console.log('📋 Processing line:', line);

                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim();
                  console.log('🔍 SSE data:', data);

                  // Skip heartbeat messages
                  if (data.startsWith('ping ') || data === 'connected') {
                    console.log('💓 Heartbeat received');
                    continue;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    console.log('📊 Parsed SSE data:', parsed);

                    // Check if this result is for our element
                    if (parsed.elementid && parsed.output) {
                      console.log('🔍 Comparing element IDs:');
                      console.log('  Received:', parsed.elementid);
                      console.log('  Expected:', elementId);

                      // Try exact match first
                      const exactMatch = parsed.elementid === elementId;

                      console.log('  Exact Match:', exactMatch);

                      // Only accept exact matches to prevent cross-field contamination
                      if (exactMatch) {
                        console.log('🎯 Found result for our element:', elementId);
                        console.log('📝 Output:', parsed.output);
                        hasReceivedResult = true;
                        clearTimeout(timeout);

                        // Close the reader to clean up the connection
                        try {
                          reader.cancel();
                        } catch (e) {
                          // Ignore cleanup errors
                        }

                        resolve(parsed.output);
                        return;
                      } else {
                        console.log('📋 Received result for different element:', parsed.elementid, '(waiting for:', elementId, ')');
                      }
                    } else {
                      console.log('📢 Other SSE message:', parsed);
                    }
                  } catch (parseError) {
                    console.log('⚠️ Failed to parse SSE data as JSON:', data, 'Error:', parseError instanceof Error ? parseError.message : 'Unknown error');
                  }
                } else if (line.startsWith('event: ')) {
                  const event = line.slice(7).trim();
                  console.log('📢 SSE Event:', event);
                }
              }
            }
          } catch (error) {
            clearTimeout(timeout);
            reject(error);
          }
        };

        readStream();
      })
      .catch(error => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }





  /**
   * Generates content for a single field
   */
  async generateFieldContent(request: AIGenerationRequest): Promise<string> {
    const prompt = this.generatePrompt(
      request.fieldType,
      request.currentValue,
      request.context || request.prompt
    );

    return await this.makeAIRequest(request.elementId, request.fieldName, prompt);
  }

  /**
   * Generates content for multiple fields at once
   */
  async generateMultipleFields(requests: AIGenerationRequest[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    // Process requests in parallel for better performance
    const promises = requests.map(async (request) => {
      try {
        const content = await this.generateFieldContent(request);
        return { fieldName: request.fieldName, content };
      } catch (error) {
        console.error(`Failed to generate content for field ${request.fieldName}:`, error);
        return { fieldName: request.fieldName, content: null };
      }
    });

    const responses = await Promise.allSettled(promises);
    
    responses.forEach((response) => {
      if (response.status === 'fulfilled' && response.value.content) {
        results[response.value.fieldName] = response.value.content;
      }
    });

    return results;
  }

  /**
   * Tests the AI API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeAIRequest('test-element', 'test-field', 'Test connection. Respond with "OK".');
      return true;
    } catch (error) {
      console.error('AI API connection test failed:', error);
      return false;
    }
  }
}

/**
 * Default AI service instance
 */
export const aiService = new AIService();

/**
 * Utility function to create a custom AI service with specific configuration
 */
export const createAIService = (config: Partial<AIAPIConfig>): AIService => {
  return new AIService(config);
};
