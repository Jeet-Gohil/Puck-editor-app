# 🔧 Technical Documentation - Puck Editor AI Integration

## 📋 **Table of Contents**
1. [Architecture Overview](#architecture-overview)
2. [Complete Workflow](#complete-workflow)
3. [File Structure & Functions](#file-structure--functions)
4. [Element ID System](#element-id-system)
5. [SSE Communication Flow](#sse-communication-flow)
6. [Data Flow & State Management](#data-flow--state-management)
7. [Error Handling & Debugging](#error-handling--debugging)

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Puck Editor   │  │  Enhanced       │  │   AI Service    │  │
│  │   Components    │  │  Form Fields    │  │   (SSE Client)  │  │
│  │                 │  │                 │  │                 │  │
│  │ • HeroSection   │  │ • TextField     │  │ • makeAIRequest │  │
│  │ • FeatureSection│  │ • TextAreaField │  │ • SSE Streaming │  │
│  │                 │  │ • AIButton      │  │ • Error Handling│  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                     │                     │         │
│           └─────────────────────┼─────────────────────┘         │
│                                 │                               │
├─────────────────────────────────┼─────────────────────────────────┤
│                    ┌─────────────▼─────────────┐                │
│                    │     API Route             │                │
│                    │  /api/generate-ai         │                │
│                    │                           │                │
│                    │ • Request Processing      │                │
│                    │ • AI Service Integration  │                │
│                    │ • Data Persistence        │                │
│                    │ • Response Formatting     │                │
│                    └─────────────┬─────────────┘                │
└─────────────────────────────────┼─────────────────────────────────┘
                                  │ HTTP POST
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PYTHON SSE SERVER                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Job Queue     │  │   Worker        │  │   SSE Stream    │  │
│  │                 │  │   Thread        │  │                 │  │
│  │ • Queue Jobs    │  │ • Process Jobs  │  │ • Broadcast     │  │
│  │ • Deduplication │  │ • OpenAI API    │  │ • Event Stream  │  │
│  │ • FIFO Order    │  │ • Function Call │  │ • Heartbeat     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                     │                     │         │
│           └─────────────────────┼─────────────────────┘         │
│                                 │                               │
│                    ┌─────────────▼─────────────┐                │
│                    │      OpenAI API           │                │
│                    │                           │                │
│                    │ • GPT-4o-mini Model       │                │
│                    │ • Function Calling        │                │
│                    │ • Structured Output       │                │
│                    └───────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 **Complete Workflow**

### **Step 1: User Interaction**
```typescript
// File: src/components/fields/EnhancedTextField.tsx
// Function: handleAIGenerate()

const handleAIGenerate = async () => {
  setIsGenerating(true);
  
  try {
    // Create unique element ID
    const elementId = `${componentId}_custom_${name}`;
    
    // Call API route
    const response = await fetch('/api/generate-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        elementId,
        fieldName: name,
        fieldType: 'text',
        currentValue: value,
      }),
    });
    
    const result = await response.json();
    // Handle response...
  } catch (error) {
    console.error('AI generation failed:', error);
  } finally {
    setIsGenerating(false);
  }
};
```

### **Step 2: API Route Processing**
```typescript
// File: src/app/api/generate-ai/route.ts
// Function: POST()

export async function POST(request: Request) {
  try {
    // 1. Parse request body
    const { elementId, fieldName, fieldType, currentValue } = await request.json();
    
    // 2. Create AI service instance
    const aiService = new AIService({
      endpoint: 'http://localhost:8000/generate',
      streamEndpoint: 'http://localhost:8000/stream'
    });
    
    // 3. Generate content via SSE
    const generatedContent = await aiService.generateFieldContent({
      elementId,
      fieldName,
      fieldType,
      currentValue,
    });
    
    // 4. Save to persistent storage
    const data = readAIData();
    data[elementId] = {
      [fieldName]: {
        value: generatedContent,
        timestamp: new Date().toISOString(),
        generated: true,
        fieldType,
      }
    };
    writeAIData(data);
    
    // 5. Return response
    return NextResponse.json({
      success: true,
      elementId,
      generatedFields: data[elementId]
    });
    
  } catch (error) {
    // Fallback handling...
  }
}
```

### **Step 3: AI Service SSE Communication**
```typescript
// File: src/utils/aiService.ts
// Function: makeAIRequest()

private async makeAIRequest(elementId: string, fieldName: string, prompt: string): Promise<string> {
  // 1. Submit job to Python server
  const jobResponse = await fetch('http://localhost:8000/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      elementid: elementId,
      field: fieldName,
      business_description: this.getBusinessDescription(),
      prompt: prompt,
    }),
  });
  
  // 2. Connect to SSE stream
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timeout after 45 seconds for element: ${elementId}`));
    }, 45000);

    fetch('http://localhost:8000/stream', {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    })
    .then(response => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      const readStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              
              try {
                const parsed = JSON.parse(data);
                
                // 3. Check for exact element ID match
                if (parsed.elementid === elementId && parsed.output) {
                  clearTimeout(timeout);
                  resolve(parsed.output);
                  return;
                }
              } catch (parseError) {
                // Ignore non-JSON data
              }
            }
          }
        }
      };
      
      readStream();
    });
  });
}
```

### **Step 4: Python SSE Server Processing**
```python
# File: test_sse_server.py
# Function: generate() and worker_loop()

@app.route("/generate", methods=["POST"])
def generate():
    """Queue AI generation job"""
    data = request.get_json(silent=True) or {}
    elementid = data.get("elementid")
    field = data.get("field")
    business_description = data.get("business_description")
    prompt = data.get("prompt")
    
    # Validate required fields
    missing = [k for k in ("elementid", "field", "business_description", "prompt") if not data.get(k)]
    if missing:
        return {"ok": False, "error": f"Missing fields: {', '.join(missing)}"}, 400
    
    # Check for duplicate jobs
    with job_lock:
        if elementid in active_jobs:
            return {"ok": True, "queued": True, "elementid": elementid, "status": "already_processing"}
    
    # Queue the job
    job = dict(
        elementid=elementid,
        field=field,
        business_description=business_description,
        prompt=prompt,
        ts=time.time(),
    )
    jobs_q.put_nowait(job)
    
    return {"ok": True, "queued": True, "elementid": elementid}

def worker_loop():
    """Background worker processes jobs sequentially"""
    while True:
        job = jobs_q.get()  # Block until job available
        elementid = job["elementid"]
        
        try:
            # Mark job as active
            with job_lock:
                if elementid in active_jobs:
                    jobs_q.task_done()
                    continue
                active_jobs.add(elementid)
            
            # Process with OpenAI
            result = run_openai_function_call(
                elementid=elementid,
                field=job["field"],
                business_description=job["business_description"],
                prompt=job["prompt"],
            )
            
            # Broadcast result
            broadcast("result", result)
            
        except Exception as e:
            broadcast("error", {"message": str(e), "elementid": elementid})
        finally:
            # Clean up
            with job_lock:
                active_jobs.discard(elementid)
            jobs_q.task_done()
```

### **Step 5: OpenAI Function Calling**
```python
# File: test_sse_server.py
# Function: run_openai_function_call()

def run_openai_function_call(elementid: str, field: str, business_description: str, prompt: str):
    """Call OpenAI with function calling for structured output"""

    # Build messages for OpenAI
    messages = build_messages(elementid, field, business_description, prompt)

    # Call OpenAI API with function calling
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        tools=get_tools_schema(),  # Function schema
        tool_choice="required",
        temperature=0.7,
        max_tokens=150,
    )

    choice = response.choices[0]
    tool_calls = choice.message.tool_calls

    # Extract function call result
    if tool_calls:
        for tc in tool_calls:
            if tc.function and tc.function.name == "deliver_website_content":
                args = json.loads(tc.function.arguments or "{}")

                # CRITICAL: Always use original elementid to prevent field mixing
                return {
                    "elementid": elementid,  # Use original, not OpenAI's version
                    "output": args.get("output") or "",
                }

    # Fallback
    content = (choice.message.content or "").strip()
    return {"elementid": elementid, "output": content}

def get_tools_schema():
    """Define OpenAI function schema for structured output"""
    return [
        {
            "type": "function",
            "function": {
                "name": "deliver_website_content",
                "description": "Return finalized website content for a specific element id as structured JSON.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "elementid": {"type": "string", "description": "The element identifier"},
                        "output": {"type": "string", "description": "Final generated content for the website field"}
                    },
                    "required": ["elementid", "output"],
                    "additionalProperties": False
                }
            },
        }
    ]
```

### **Step 6: SSE Broadcasting**
```python
# File: test_sse_server.py
# Function: broadcast() and sse_stream()

def broadcast(event_type: str, data: dict):
    """Broadcast data to all SSE clients"""
    global sse_clients

    # Format SSE message
    message = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"

    # Send to all connected clients
    dead_clients = []
    for client_id, client_queue in sse_clients.items():
        try:
            client_queue.put_nowait(message)
        except Exception:
            dead_clients.append(client_id)

    # Clean up dead clients
    for client_id in dead_clients:
        sse_clients.pop(client_id, None)

@app.route("/stream", methods=["GET"])
def sse_stream():
    """SSE endpoint for real-time updates"""
    def sse_generator():
        client_id = str(uuid.uuid4())
        client_queue = queue.Queue()
        sse_clients[client_id] = client_queue

        try:
            # Send initial connection message
            yield "event: connected\ndata: connected\n\n"

            while True:
                try:
                    # Send heartbeat every second
                    yield f"event: ping\ndata: ping {time.time()}\n\n"

                    # Check for queued messages
                    try:
                        message = client_queue.get_nowait()
                        yield message
                    except queue.Empty:
                        pass

                    time.sleep(1)

                except GeneratorExit:
                    break

        finally:
            # Clean up client
            sse_clients.pop(client_id, None)

    headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
    }
    return Response(sse_generator(), mimetype="text/event-stream", headers=headers)
```

## 🆔 **Element ID System**

### **Element ID Format**
```
{ComponentType}-{UUID}_custom_{fieldName}
```

**Examples:**
- `HeroSectionOne-abc123_custom_navbarBrand`
- `HeroSectionOne-abc123_custom_title`
- `FeatureSection-def456_custom_description`

### **Element ID Generation**
```typescript
// File: src/components/fields/EnhancedTextField.tsx
// Function: Component render

const EnhancedTextField: React.FC<EnhancedTextFieldProps> = ({
  componentId,  // e.g., "HeroSectionOne-abc123"
  name,         // e.g., "navbarBrand"
  ...props
}) => {
  // Generate unique element ID for AI requests
  const elementId = `${componentId}_custom_${name}`;
  // Result: "HeroSectionOne-abc123_custom_navbarBrand"

  const handleAIGenerate = async () => {
    // Use this elementId for API calls
    const response = await fetch('/api/generate-ai', {
      method: 'POST',
      body: JSON.stringify({
        elementId,  // Sent to backend
        fieldName: name,
        fieldType: 'text',
      }),
    });
  };
};
```

### **Element ID Mapping Flow**
```
1. Frontend generates: "HeroSectionOne-abc123_custom_navbarBrand"
   ↓
2. API route receives: "HeroSectionOne-abc123_custom_navbarBrand"
   ↓
3. AI Service sends to Python: "HeroSectionOne-abc123_custom_navbarBrand"
   ↓
4. Python processes job with: "HeroSectionOne-abc123_custom_navbarBrand"
   ↓
5. OpenAI might return: "HeroSectionOne-abc123" (modified!)
   ↓
6. Python ALWAYS uses original: "HeroSectionOne-abc123_custom_navbarBrand"
   ↓
7. SSE broadcasts: {"elementid": "HeroSectionOne-abc123_custom_navbarBrand", "output": "..."}
   ↓
8. Frontend matches EXACT ID: "HeroSectionOne-abc123_custom_navbarBrand"
   ↓
9. Content updates correct field: navbarBrand
```

## 📡 **SSE Communication Flow**

### **Connection Lifecycle**
```typescript
// File: src/utils/aiService.ts

1. Job Submission (POST /generate)
   ├── Request: {"elementid": "...", "field": "...", "prompt": "..."}
   └── Response: {"ok": true, "queued": true, "elementid": "..."}

2. SSE Connection (GET /stream)
   ├── Headers: {"Accept": "text/event-stream", "Cache-Control": "no-cache"}
   ├── Connection: Keep-alive streaming
   └── Events:
       ├── event: connected
       │   data: connected
       ├── event: ping
       │   data: ping 1692345678.123
       ├── event: status
       │   data: {"message": "processing", "elementid": "..."}
       └── event: result
           data: {"elementid": "...", "output": "Generated content"}

3. Result Processing
   ├── Parse SSE data as JSON
   ├── Check elementid === expectedElementId
   ├── Extract output field
   └── Resolve Promise with content
```

### **SSE Message Format**
```
event: result
data: {"elementid": "HeroSectionOne-abc123_custom_navbarBrand", "output": "TechFlow Pro"}

event: status
data: {"message": "processing", "elementid": "HeroSectionOne-abc123_custom_navbarBrand"}

event: error
data: {"message": "generation failed", "elementid": "HeroSectionOne-abc123_custom_navbarBrand"}

event: ping
data: ping 1692345678.123
```

## 💾 **Data Flow & State Management**

### **AI Data Storage Structure**
```json
// File: data/ai-generated-content.json
{
  "HeroSectionOne-abc123_custom_navbarBrand": {
    "navbarBrand": {
      "value": "TechFlow Pro",
      "timestamp": "2025-08-16T10:00:00.000Z",
      "generated": true,
      "fieldType": "text"
    }
  },
  "HeroSectionOne-abc123_custom_title": {
    "title": {
      "value": "Revolutionary SaaS Platform",
      "timestamp": "2025-08-16T10:01:00.000Z",
      "generated": true,
      "fieldType": "title"
    }
  }
}
```

### **Data Persistence Flow**
```typescript
// File: src/utils/aiDataHandler.ts

1. Read existing data
   const data = readAIData();

2. Update with new content
   data[elementId] = {
     [fieldName]: {
       value: generatedContent,
       timestamp: new Date().toISOString(),
       generated: true,
       fieldType,
     }
   };

3. Write back to file
   writeAIData(data);

4. Broadcast to frontend
   // Data automatically syncs via useAIDataWatcher hook
```

### **Real-time Updates**
```typescript
// File: src/hooks/useAIDataWatcher.ts

export const useAIDataWatcher = (onDataChange: (data: AIData) => void) => {
  useEffect(() => {
    const pollData = async () => {
      try {
        const response = await fetch('/api/ai-data');
        const newData = await response.json();

        if (JSON.stringify(newData) !== JSON.stringify(lastData.current)) {
          lastData.current = newData;
          onDataChange(newData);
        }
      } catch (error) {
        console.error('Error polling AI data:', error);
      }
    };

    // Poll every 2 seconds for updates
    const interval = setInterval(pollData, 2000);
    pollData(); // Initial load

    return () => clearInterval(interval);
  }, [onDataChange]);
};
```

### **Puck Data Integration**
```typescript
// File: src/app/editor/page.tsx

const handleAIResponse = useCallback((aiData: AIData) => {
  setData((prevData) => {
    let updatedData = prevData;

    Object.entries(aiData).forEach(([elementKey, fields]) => {
      // Extract elementId from key: "ElementType-uuid_custom_fieldName" -> "ElementType-uuid"
      const elementId = elementKey.split('_custom_')[0];

      // Convert AI field data to simple field values
      const generatedFields: Record<string, string> = {};
      Object.entries(fields).forEach(([fieldName, fieldData]) => {
        generatedFields[fieldName] = fieldData.value;
      });

      // Update Puck's data structure
      updatedData = updateElementFields(updatedData, elementId, generatedFields);
    });

    return updatedData;
  });
}, []);
```

## 📁 **File Structure & Functions**

### **Frontend Files**

#### **Enhanced Form Fields**
```typescript
// src/components/fields/EnhancedTextField.tsx
├── EnhancedTextField (Main component)
├── handleAIGenerate() (AI generation trigger)
├── useEffect() (Value synchronization)
└── Props: componentId, name, value, onChange, placeholder

// src/components/fields/EnhancedTextAreaField.tsx
├── EnhancedTextAreaField (Main component)
├── handleAIGenerate() (AI generation trigger)
└── Similar structure to TextField

// src/components/ui/AIGenerateButton.tsx
├── AIGenerateButton (Reusable AI button)
├── Props: onClick, isGenerating, disabled
└── Loading states and animations
```

#### **Puck Components**
```typescript
// src/components/sections/HeroSectionOne.tsx
├── HeroSectionOne (Puck component)
├── Multiple enhanced fields:
│   ├── navbarBrand (EnhancedTextField)
│   ├── title (EnhancedTextField)
│   ├── description (EnhancedTextAreaField)
│   ├── primaryButtonText (EnhancedTextField)
│   └── secondaryButtonText (EnhancedTextField)
└── Component registration in Puck config

// src/config/puck.ts
├── PuckConfig (Main configuration)
├── Component definitions
├── Field configurations
└── Default props
```

#### **Core Services**
```typescript
// src/utils/aiService.ts
├── AIService class
├── makeAIRequest() (SSE communication)
├── generateFieldContent() (Public API)
├── generatePrompt() (Prompt generation)
└── validateConfig() (Configuration validation)

// src/utils/aiDataHandler.ts
├── readAIData() (Read from JSON file)
├── writeAIData() (Write to JSON file)
├── ensureDataDirectory() (Directory creation)
└── validateAndRepairAIData() (Data integrity)

// src/utils/puckDataUpdater.ts
├── updatePuckData() (Update Puck's data structure)
├── registerPuckDataSetter() (Register data setter)
└── unregisterPuckDataSetter() (Cleanup)

// src/utils/puckFieldUpdater.ts
├── updatePuckField() (Direct DOM field updates)
├── findFieldElement() (DOM element location)
└── addVisualFeedback() (UI feedback)
```

#### **API Routes**
```typescript
// src/app/api/generate-ai/route.ts
├── POST() (Main AI generation endpoint)
├── Request validation
├── AI service integration
├── Data persistence
└── Response formatting

// src/app/api/ai-data/route.ts
├── GET() (AI data retrieval)
└── JSON file reading
```

#### **Hooks & State**
```typescript
// src/hooks/useAIDataWatcher.ts
├── useAIDataWatcher() (Real-time data polling)
├── Data change detection
└── Automatic updates

// src/app/editor/page.tsx
├── EditorPage (Main editor component)
├── handleAIResponse() (AI data integration)
├── updateElementFields() (Puck data updates)
└── Puck editor configuration
```

### **Backend Files**

#### **Python SSE Server**
```python
# test_sse_server.py
├── Flask app setup
├── SSE client management
├── Job queue system
├── OpenAI integration
└── Main endpoints:

# Endpoints
├── /generate (POST) - Job submission
│   ├── Request validation
│   ├── Duplicate job checking
│   └── Job queuing
├── /stream (GET) - SSE stream
│   ├── Client management
│   ├── Heartbeat system
│   └── Event broadcasting
├── /test (GET) - Health check
└── /test-broadcast (POST) - Manual testing

# Core Functions
├── worker_loop() - Background job processing
├── run_openai_function_call() - OpenAI API calls
├── broadcast() - SSE message broadcasting
├── get_tools_schema() - OpenAI function schema
└── build_messages() - OpenAI message formatting
```

## 🚨 **Error Handling & Debugging**

### **Frontend Error Handling**
```typescript
// src/utils/aiService.ts
try {
  const result = await this.makeAIRequest(elementId, fieldName, prompt);
  return result;
} catch (error) {
  console.error('❌ AI request failed:', error);
  throw error; // Re-throw for API route handling
}

// src/app/api/generate-ai/route.ts
try {
  generatedContent = await aiService.genera teFieldContent({...});
} catch (aiError) {
  console.error('❌ AI service failed, using fallback content:', aiError);

  // Fallback to default content
  const fallbackField = FALLBACK_AI_FIELDS[fieldName];
  generatedContent = fallbackField?.value || `Generated ${fieldType} content`;
}
```

### **Backend Error Handling**
```python
# test_sse_server.py
def worker_loop():
    while True:
        job = jobs_q.get()
        elementid = None
        try:
            elementid = job["elementid"]
            # Process job...
            result = run_openai_function_call(...)
            broadcast("result", result)
        except Exception as e:
            error_msg = f"generation failed: {str(e)}"
            print(f"❌ {error_msg}")
            if elementid:
                broadcast("error", {"message": error_msg, "elementid": elementid})
        finally:
            if elementid:
                with job_lock:
                    active_jobs.discard(elementid)
            jobs_q.task_done()
```

### **Debug Logging Patterns**

#### **Frontend Debug Logs**
```
🚀 Starting AI request for: {elementId} {fieldName}
📝 Request body: {requestBody}
🎯 Looking for exact element ID: {elementId}
📤 Step 1: Submitting job to /generate
✅ Job submitted successfully: {jobResult}
📡 Step 2: Connecting to SSE stream: {streamEndpoint}
🔗 Creating new SSE connection for element: {elementId}
📡 SSE Response received: {status} {statusText}
✅ SSE stream connected, starting to read...
📖 Starting to read SSE stream for element: {elementId}
📦 Raw SSE chunk: {chunk}
📋 Processing line: {line}
🔍 SSE data: {data}
💓 Heartbeat received
📊 Parsed SSE data: {parsed}
🔍 Comparing element IDs:
  Received: {parsed.elementid}
  Expected: {elementId}
  Exact Match: {exactMatch}
🎯 Found result for our element: {elementId}
📝 Output: {parsed.output}
❌ Request timeout after 45 seconds for element: {elementId}
```

#### **Backend Debug Logs**
```
📥 Queued job for {elementid}, field: {field}
🚀 Processing job for element: {elementid}, field: {field}
📊 Queue size: {qsize}, Active jobs: {active_count}
🔍 Element ID breakdown: base='{base_id}', field_suffix='{field_suffix}'
🤖 Calling OpenAI for element: {elementid}
🔍 OpenAI function call args: {args}
🔍 Original elementid: {elementid}
🔍 OpenAI returned elementid: {received_elementid}
🎯 Final output: {output}
✅ Generated content for {elementid} in {time}s: {content}
❌ generation failed after {time}s: {error}
```

### **Common Debug Scenarios**

#### **Element ID Mismatch**
```
Frontend sends: "HeroSectionOne-abc123_custom_navbarBrand"
Python receives: "HeroSectionOne-abc123_custom_navbarBrand"
OpenAI returns: "HeroSectionOne-abc123" (WRONG!)
Python corrects: "HeroSectionOne-abc123_custom_navbarBrand" (FIXED!)
Frontend matches: EXACT MATCH ✅
```

#### **SSE Connection Issues**
```
1. Check /stream endpoint accessibility
2. Verify SSE headers are correct
3. Monitor client connection lifecycle
4. Check for network timeouts
5. Validate JSON parsing
```

#### **Job Processing Issues**
```
1. Monitor job queue size
2. Check for duplicate job detection
3. Verify OpenAI API connectivity
4. Monitor worker thread health
5. Check for memory leaks in client management
```

---

## 🎯 **Key Implementation Insights**

1. **Element ID Consistency**: The most critical aspect is maintaining exact element ID consistency throughout the entire flow
2. **SSE Connection Management**: Each AI request creates a new SSE connection to avoid interference
3. **Error Resilience**: Multiple fallback layers ensure the system remains functional even when AI fails
4. **Real-time Sync**: Polling-based data synchronization keeps the UI updated with generated content
5. **Debugging Visibility**: Extensive logging at every step enables easy troubleshooting

This architecture ensures reliable, scalable AI-powered content generation with clear separation of concerns and robust error handling.
