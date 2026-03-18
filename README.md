# jxus-ai
AI Agent with OSS Ollama LLMs.
=======
# Full-Stack AI Chat Agent

This is a complete, production-ready AI chat agent application built with:
- Vanilla HTML/CSS/JS (Frontend)
- FastAPI (Backend)
- Ollama (Local LLM Runtime using `tinyllama`)
- Docker & Docker Compose (Containerization)

## Runtime Instructions

### 1. Start the Containers
Open a terminal in this directory and start the services using docker-compose:
```bash
docker-compose up --build -d
```

### 2. Pull the AI Model
By default, the backend expects the `tinyllama` model. Since the Ollama container starts without any models downloaded, you need to pull it inside the running container. Run this command:
```bash
docker exec -it ollama ollama pull tinyllama
```
*(Alternatively, you can pull `phi`: `docker exec -it ollama ollama pull phi`, but remember to update `OLLAMA_MODEL` environment variable in `docker-compose.yml` to `phi` if you do so.)*

### 3. Access the Application
Once the model is pulled, your AI agent is ready! Open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)

Enjoy your fast, private, locally hosted AI chat agent!
