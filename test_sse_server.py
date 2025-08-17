# sse_generate_server.py
import os
import json
import time
import threading
from queue import Queue, Empty
from typing import Dict, Any
from flask import Flask, Response, request
from dotenv import load_dotenv
load_dotenv('.env.local') 

# ------------- Configuration -------------
# Set OPENAI_API_KEY in the environment
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  # choose a cost-effective content expert model
 
# ------------- App and State -------------
app = Flask(__name__)
 
# Global broadcast queue for SSE (all clients receive the same status updates)
broadcast_q = Queue(maxsize=1000)

# Work queue for incoming generation jobs (accepts concurrent POSTs)
jobs_q = Queue(maxsize=100)

# Track active jobs to prevent duplicates
active_jobs = set()
job_lock = threading.Lock()
 
# Each job produces exactly one final output with the required schema:
# {"elementid": "...", "output": "..."}
 
# ------------- SSE Utilities -------------
def sse_format(data: str, event: str = None, id: str = None, retry: int = None) -> str:
    """
    Format message per SSE spec:
    - optional event, id, retry
    - data lines
    - blank line terminator
    """
    lines = []
    if event:
        lines.append(f"event: {event}")
    if id:
        lines.append(f"id: {id}")
    if retry is not None:
        lines.append(f"retry: {retry}")
    for line in str(data).splitlines():
        lines.append(f"data: {line}")
    lines.append("")
    return "\n".join(lines) + "\n"
 
def broadcast(event: str, payload: Any) -> None:
    """
    Send a JSON serializable payload to all listeners via global broadcast queue.
    """
    try:
        message = sse_format(json.dumps(payload), event=event)
        broadcast_q.put_nowait(message)
    except Exception:
        # Drop if queue full to keep stream healthy on tiny instances
        pass
 
def sse_stream():
    """
    SSE generator emitting:
    - heartbeat every 1s (event=ping)
    - any broadcast messages produced by POST/worker
    """
    # Let the client reconnect faster if dropped
    yield sse_format("connected", event="status", retry=2000)
 
    last_heartbeat = 0.0
    while True:
        now = time.time()
        # 1s heartbeat
        if now - last_heartbeat >= 1.0:
            last_heartbeat = now
            yield sse_format(f"ping {now:.3f}", event="ping")
        # Drain any broadcast messages quickly
        try:
            msg = broadcast_q.get(timeout=0.1)
            yield msg
        except Empty:
            pass
        time.sleep(0.05)
 
@app.route("/stream")
def stream():
    headers = {
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",  # if behind Nginx, prevent buffering
    }
    return Response(sse_stream(), mimetype="text/event-stream", headers=headers)
 
# ------------- OpenAI Function Calling -------------
# We define a tool that enforces the target output schema.
# The model will call this "function" with arguments, which we then return as the final output.
# This approach keeps a consistent schema across runs.
 
def get_tools_schema():
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
 
def build_messages(elementid: str, field: str, business_description: str, prompt: str):
    system = (
        "Act as a senior website content expert focused on high-conversion copy for SaaS websites. "
        "Write concise, engaging, on-brand content. Avoid placeholders. Return content suitable for direct placement."
    )
    user = (
        f"Business description: {business_description}\n"
        f"Field to generate: {field}\n"
        f"Prompt/instructions: {prompt}\n"
        f"Element ID: {elementid}\n"
        "Generate the content strictly for the specified field and be succinct."
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]
 
# Minimal OpenAI client import (official SDK)
# pip install openai
from openai import OpenAI  # official library entrypoint

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Initialize OpenAI client with API key from environment
api_key = os.getenv('OPENAI_API_KEY') or os.getenv('OPEN_API_KEY')
if not api_key:
    print("❌ Error: OpenAI API key not found!")
    print("Please set OPENAI_API_KEY or OPEN_API_KEY in your environment variables or .env file")
    print("Example: OPENAI_API_KEY=sk-proj-your-key-here")
    exit(1)

client = OpenAI(api_key=api_key)
print(f"✅ OpenAI client initialized with API key: {api_key[:20]}...")
 
def run_openai_function_call(elementid: str, field: str, business_description: str, prompt: str) -> Dict[str, Any]:
    """
    Use function calling so the final output is guaranteed to follow:
    {"elementid": ..., "output": ...}
    """
    messages = build_messages(elementid, field, business_description, prompt)
    tools = get_tools_schema()
 
    # Let the model choose to call our tool and produce structured args
    # Using Chat Completions pattern with tools to trigger a function call
    resp = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=messages,
        tools=tools,
        tool_choice="auto",
        temperature=0.7,
    )
 
    choice = resp.choices[0]
    tool_calls = getattr(choice.message, "tool_calls", None)
 
    # If the model called our function, extract args
    if tool_calls:
        for tc in tool_calls:
            if tc.function and tc.function.name == "deliver_website_content":
                try:
                    args = json.loads(tc.function.arguments or "{}")
                except Exception:
                    args = {}
                # Validate and coerce minimally
                received_elementid = args.get("elementid")
                print(f"🔍 OpenAI function call args: {args}")
                print(f"🔍 Original elementid: {elementid}")
                print(f"🔍 OpenAI returned elementid: {received_elementid}")

                # Always use the original elementid to ensure consistency
                out = {
                    "elementid": elementid,  # Use original, not OpenAI's version
                    "output": args.get("output") or "",
                }
                print(f"🎯 Final output: {out}")
                return out
 
    # Fallback: if no tool call, build a compliant object from the content
    content = (choice.message.content or "").strip()
    return {"elementid": elementid, "output": content}
 
# ------------- Background Worker -------------
def worker_loop():
    """
    Processes incoming jobs sequentially, updates SSE statuses, and posts final JSON result.
    This ensures concurrent POSTs queue safely while SSE remains responsive.
    """
    while True:
        job = jobs_q.get()  # blocks until a job arrives
        start_time = time.time()
        elementid = None
        try:
            elementid = job["elementid"]
            field = job["field"]
            business_description = job["business_description"]
            prompt = job["prompt"]

            # Check if this job is already being processed
            with job_lock:
                if elementid in active_jobs:
                    print(f"⚠️ Job for {elementid} already in progress, skipping duplicate")
                    jobs_q.task_done()
                    continue
                active_jobs.add(elementid)

            print(f"🚀 Processing job for element: {elementid}, field: {field}")
            print(f"📊 Queue size: {jobs_q.qsize()}, Active jobs: {len(active_jobs)}")

            # Validate element ID format
            if '_custom_' not in elementid:
                print(f"⚠️ Warning: Element ID doesn't contain '_custom_': {elementid}")
            else:
                base_id, field_suffix = elementid.split('_custom_', 1)
                print(f"🔍 Element ID breakdown: base='{base_id}', field_suffix='{field_suffix}'")

            # 1) Broadcast: received details to enhance field "X"
            broadcast("status", {
                "message": f'received details to enhance field "{field}"',
                "elementid": elementid
            })

            # 2) Broadcast: processing
            broadcast("status", {"message": "processing", "elementid": elementid})

            # 3) Run OpenAI function-calling to produce structured output
            print(f"🤖 Calling OpenAI for element: {elementid}")
            result = run_openai_function_call(
                elementid=elementid,
                field=field,
                business_description=business_description,
                prompt=prompt,
            )

            processing_time = time.time() - start_time
            print(f"✅ Generated content for {elementid} in {processing_time:.2f}s: {result.get('output', '')[:100]}...")

            # 4) Broadcast final output object
            broadcast("result", result)

        except Exception as e:
            processing_time = time.time() - start_time
            error_msg = f"generation failed after {processing_time:.2f}s: {str(e)}"
            print(f"❌ {error_msg}")
            if elementid:
                broadcast("error", {"message": error_msg, "elementid": elementid})
        finally:
            # Remove from active jobs
            if elementid:
                with job_lock:
                    active_jobs.discard(elementid)
            jobs_q.task_done()
 
# Start worker thread
t = threading.Thread(target=worker_loop, daemon=True)
t.start()
 
# ------------- HTTP API -------------
@app.route("/generate", methods=["POST"])
def generate():
    """
    Accepts: {
        "elementid": "abc123",
        "field": "title",
        "business_description": "SaaS company homepage",
        "prompt": "Make it catchy"
    }
    Enqueues a job and returns immediately.
    Status and final structured output are sent over SSE.
    """
    data = request.get_json(silent=True) or {}
    elementid = data.get("elementid")
    field = data.get("field")
    business_description = data.get("business_description")
    prompt = data.get("prompt")

    missing = [k for k in ("elementid", "field", "business_description", "prompt") if not data.get(k)]
    if missing:
        return {"ok": False, "error": f"Missing fields: {', '.join(missing)}"}, 400

    # Check if this job is already queued or being processed
    with job_lock:
        if elementid in active_jobs:
            print(f"⚠️ Job for {elementid} already active, returning existing status")
            return {"ok": True, "queued": True, "elementid": elementid, "status": "already_processing"}

    job = dict(
        elementid=elementid,
        field=field,
        business_description=business_description,
        prompt=prompt,
        ts=time.time(),
    )
    try:
        jobs_q.put_nowait(job)
        print(f"📥 Queued job for {elementid}, field: {field}")
    except Exception:
        return {"ok": False, "error": "Server busy, try again"}, 503

    # Immediate ack; stream will carry statuses and final result
    return {"ok": True, "queued": True, "elementid": elementid}

@app.route("/test", methods=["GET"])
def test():
    """Test endpoint to check if server is working"""
    return {"status": "ok", "message": "SSE server is running", "queue_size": jobs_q.qsize(), "active_jobs": len(active_jobs)}

@app.route("/test-broadcast", methods=["POST"])
def test_broadcast():
    """Test endpoint to manually broadcast a message"""
    test_message = {
        "elementid": "test-element",
        "output": "Test message from server"
    }
    broadcast("result", test_message)
    return {"status": "ok", "message": "Test message broadcasted"}

if __name__ == "__main__":
    # Dev run; for production on small instances use:
    # gunicorn -b 0.0.0.0:8000 --worker-class gevent --workers 1 sse_generate_server:app
    app.run(host="0.0.0.0", port=8000, debug=False, threaded=True)
 