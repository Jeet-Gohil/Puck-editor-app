# 🎨 Puck Editor App with AI Integration

A modern web application builder using **Puck Editor** with **AI-powered content generation** via **Server-Sent Events (SSE)**.

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js API   │    │  Python SSE     │
│   (React/Puck)  │◄──►│   Routes        │◄──►│  Server         │
│                 │    │                 │    │  (OpenAI)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Start Python SSE Server**
```bash
python test_sse_server.py
```

### **3. Start Frontend**
```bash
npm run dev
```

### **4. Open Editor**
Navigate to: `http://localhost:3000/editor`

## 🔧 **How It Works**

### **AI Content Generation Flow**

1. **User Action**: User clicks "Generate with AI" on any field
2. **Request Creation**: Frontend creates request with unique element ID
3. **Job Submission**: POST to `/generate` endpoint queues the job
4. **SSE Connection**: GET to `/stream` endpoint listens for results
5. **AI Processing**: Python server calls OpenAI API
6. **Result Broadcasting**: Server broadcasts result via SSE
7. **Field Update**: Frontend updates the specific field

### **Element ID Format**
```
HeroSectionOne-{uuid}_custom_{fieldName}
```

Example: `HeroSectionOne-abc123_custom_navbarBrand`

## 🐛 **Common Issues & Solutions**

### **Values Going to Wrong Fields**
- **Cause**: Element ID mismatch between request and response
- **Solution**: Check console logs for "🔍 Comparing element IDs"
- **Fix**: Ensure Python server returns exact element ID

### **Timeout Errors**
- **Cause**: SSE connection not receiving results
- **Solution**: Check Python server logs for job processing
- **Debug**: Test `/stream` endpoint accessibility

### **No AI Generation**
- **Cause**: Python server not running or OpenAI API issues
- **Solution**: Check server console and API key
- **Debug**: Test `/test` endpoint for server health

## 🚨 **Troubleshooting**

### **Check SSE Server**
```bash
# Test server health
curl http://localhost:8000/test

# Test SSE stream
curl http://localhost:8000/stream
```

### **Check Frontend Logs**
Look for these log patterns:
- `🚀 Starting AI request for:`
- `🎯 Found result for our element:`
- `❌ Request timeout after 45 seconds`

### **Check Python Server Logs**
Look for these log patterns:
- `🚀 Processing job for element:`
- `✅ Generated content for ... in 2.5s:`
- `❌ generation failed after 2.5s:`

---

**Built with**: Next.js, React, Puck Editor, TypeScript, Python, OpenAI API, Server-Sent Events
