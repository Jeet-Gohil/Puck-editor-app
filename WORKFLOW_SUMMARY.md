# 🔄 Workflow Summary - AI Content Generation

## 📋 **Quick Reference**

### **Complete Flow in 9 Steps**

```
1. User clicks "Generate with AI" button
   ↓
2. Frontend creates unique element ID: "HeroSectionOne-abc123_custom_navbarBrand"
   ↓
3. POST request to /api/generate-ai with element ID and field info
   ↓
4. API route calls AIService.generateFieldContent()
   ↓
5. AIService submits job to Python server: POST /generate
   ↓
6. AIService connects to SSE stream: GET /stream
   ↓
7. Python server processes job with OpenAI API
   ↓
8. Python server broadcasts result via SSE with EXACT element ID
   ↓
9. Frontend receives result, matches element ID, updates field
```

## 🔧 **Key Files & Functions**

### **Frontend (TypeScript/React)**
- **`src/components/fields/EnhancedTextField.tsx`** → `handleAIGenerate()` - Triggers AI generation
- **`src/app/api/generate-ai/route.ts`** → `POST()` - API endpoint for AI requests
- **`src/utils/aiService.ts`** → `makeAIRequest()` - SSE communication with Python server
- **`src/utils/aiDataHandler.ts`** → `writeAIData()` - Persists generated content to JSON
- **`src/hooks/useAIDataWatcher.ts`** → `useAIDataWatcher()` - Real-time data polling
- **`src/app/editor/page.tsx`** → `handleAIResponse()` - Updates Puck editor data

### **Backend (Python/Flask)**
- **`test_sse_server.py`** → `generate()` - Receives and queues AI jobs
- **`test_sse_server.py`** → `worker_loop()` - Background job processing
- **`test_sse_server.py`** → `run_openai_function_call()` - OpenAI API integration
- **`test_sse_server.py`** → `broadcast()` - SSE message broadcasting
- **`test_sse_server.py`** → `sse_stream()` - SSE endpoint for real-time updates

## 🆔 **Element ID System**

### **Format**: `{ComponentType}-{UUID}_custom_{fieldName}`

**Example**: `HeroSectionOne-abc123_custom_navbarBrand`

### **Critical Rule**: Element ID must remain EXACTLY the same throughout entire flow

```
Frontend generates: "HeroSectionOne-abc123_custom_navbarBrand"
                    ↓ (EXACT SAME)
API route receives: "HeroSectionOne-abc123_custom_navbarBrand"
                    ↓ (EXACT SAME)
Python processes:   "HeroSectionOne-abc123_custom_navbarBrand"
                    ↓ (OpenAI might change it!)
Python CORRECTS:    "HeroSectionOne-abc123_custom_navbarBrand"
                    ↓ (EXACT SAME)
Frontend matches:   "HeroSectionOne-abc123_custom_navbarBrand" ✅
```

## 📡 **SSE Communication**

### **Job Submission**
```http
POST http://localhost:8000/generate
Content-Type: application/json

{
  "elementid": "HeroSectionOne-abc123_custom_navbarBrand",
  "field": "navbarBrand",
  "business_description": "Modern web application",
  "prompt": "Generate a professional brand name..."
}
```

### **SSE Stream Connection**
```http
GET http://localhost:8000/stream
Accept: text/event-stream
Cache-Control: no-cache
```

### **SSE Response Format**
```
event: result
data: {"elementid": "HeroSectionOne-abc123_custom_navbarBrand", "output": "TechFlow Pro"}
```

## 💾 **Data Storage**

### **AI Data Structure** (`data/ai-generated-content.json`)
```json
{
  "HeroSectionOne-abc123_custom_navbarBrand": {
    "navbarBrand": {
      "value": "TechFlow Pro",
      "timestamp": "2025-08-16T10:00:00.000Z",
      "generated": true,
      "fieldType": "text"
    }
  }
}
```

## 🐛 **Common Issues & Solutions**

### **❌ Values Going to Wrong Fields**
- **Cause**: Element ID mismatch
- **Solution**: Check console logs for "🔍 Comparing element IDs"
- **Fix**: Ensure Python server returns exact element ID

### **❌ Timeout Errors**
- **Cause**: SSE connection not receiving results
- **Solution**: Check Python server logs for job processing
- **Debug**: Test `/stream` endpoint accessibility

### **❌ No AI Generation**
- **Cause**: Python server not running or OpenAI API issues
- **Solution**: Check server console and API key
- **Debug**: Test `/test` endpoint for server health

## 🔍 **Debug Commands**

### **Test SSE Server Health**
```bash
curl http://localhost:8000/test
```

### **Test SSE Stream**
```bash
curl http://localhost:8000/stream
```

### **Manual Test Broadcast**
```bash
curl -X POST http://localhost:8000/test-broadcast
```

## 📊 **Performance Metrics**

- **SSE Connection**: ~100ms setup time
- **OpenAI API Call**: 2-5 seconds average
- **Total Request Time**: 3-6 seconds typical
- **Timeout**: 45 seconds maximum
- **Polling Interval**: 2 seconds for data sync

## 🎯 **Success Indicators**

### **Frontend Console Logs**
```
🚀 Starting AI request for: HeroSectionOne-abc123_custom_navbarBrand navbarBrand
✅ Job submitted successfully: {"ok": true, "queued": true}
🎯 Found result for our element: HeroSectionOne-abc123_custom_navbarBrand
📝 Output: TechFlow Pro
```

### **Python Server Console Logs**
```
📥 Queued job for HeroSectionOne-abc123_custom_navbarBrand, field: navbarBrand
🚀 Processing job for element: HeroSectionOne-abc123_custom_navbarBrand
✅ Generated content for HeroSectionOne-abc123_custom_navbarBrand in 2.5s: TechFlow Pro
```

## 🚀 **Quick Start Commands**

```bash
# 1. Start Python SSE Server
python test_sse_server.py

# 2. Start Frontend (new terminal)
npm run dev

# 3. Open Editor
# Navigate to: http://localhost:3000/editor

# 4. Test AI Generation
# Click any "Generate with AI" button in the editor
```

---

**For detailed technical implementation, see `TECHNICAL_DOCUMENTATION.md`**
