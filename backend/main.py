from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import os

app = FastAPI(title="AI Agent Chat API")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "tinyllama")

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "model": OLLAMA_MODEL,
                "prompt": request.message,
                "stream": False
            }
            # Make request to local ollama instance
            response = await client.post(OLLAMA_URL, json=payload, timeout=60.0)
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to get a valid response from the AI model.")
            
            data = response.json()
            ai_reply = data.get("response", "I'm sorry, I couldn't generate a response.")
            
            return ChatResponse(response=ai_reply)

    except httpx.RequestError as e:
        print(f"Error connecting to Ollama: {e}")
        raise HTTPException(status_code=503, detail="AI Model service is temporarily unavailable. Did you pull the model?")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
