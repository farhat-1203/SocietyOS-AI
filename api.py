import os
import tempfile
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.vector_db import load_index
from src.query_router import route_query
from src.rag_chat import ask as rag_ask
from src.knowledge_base import get_urgent_notices
from logic.classifier import assign_responsible, classify, detect_priority
from faster_whisper import WhisperModel


class QueryRequest(BaseModel):
    question: str
    
class QueryResponse(BaseModel):
    answer: str
    sources: list[str] = []
    intent: str | None = None


class AudioTranscriptionResponse(BaseModel):
    transcript: str
    language: str | None = None
    category: str | None = None
    confidence: float | None = None
    priority: str | None = None
    assigned_to: str | None = None


app = FastAPI(
    title="SocietyOS-AI API",
    version="0.1.0",
    description="API for RAG, knowledge base routing, and audio transcription services.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

index = None
metadata = None
stt_model = None


def normalize_sources(result):
    sources = result.get("sources")
    if sources is None:
        source = result.get("source")
        return [source] if source else []
    if isinstance(sources, str):
        return [sources]
    return sources


def get_audio_model():
    global stt_model
    if stt_model is not None:
        return stt_model

    device = os.environ.get("WHISPER_DEVICE", "cuda")
    compute_type = "float16" if device != "cpu" else "int8"

    try:
        stt_model = WhisperModel("medium", device=device, compute_type=compute_type)
    except Exception:
        stt_model = WhisperModel("medium", device="cpu", compute_type="int8")

    return stt_model


@app.on_event("startup")
def startup_event():
    global index, metadata
    index, metadata = load_index()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/knowledge/urgent")
def urgent_notices():
    return get_urgent_notices()


@app.post("/rag/query", response_model=QueryResponse)
def rag_query(request: QueryRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question must not be empty")

    result = rag_ask(request.question, index, metadata)
    return QueryResponse(
        answer=result["answer"],
        sources=normalize_sources(result),
        intent="rag",
    )


@app.post("/kb/query", response_model=QueryResponse)
def knowledge_query(request: QueryRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Query must not be empty")

    result = route_query(request.question, index, metadata)
    return QueryResponse(
        answer=result["answer"],
        sources=normalize_sources(result),
        intent=result.get("intent"),
    )


@app.post("/audio/transcribe", response_model=AudioTranscriptionResponse)
async def audio_transcribe(file: UploadFile = File(...)):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    suffix = os.path.splitext(file.filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        model = get_audio_model()
        segments, info = model.transcribe(
            tmp_path,
            beam_size=5,
            vad_filter=True,
            task="translate",
            initial_prompt=(
                "This is a housing society complaint in Hindi, Marathi, or English "
                "about plumbing, electrical, security, parking, or lift issues."
            ),
        )

        transcript = " ".join(segment.text.strip() for segment in segments).strip()
        if not transcript:
            raise HTTPException(status_code=422, detail="Could not extract speech from audio.")

        category, confidence = classify(transcript)
        priority = detect_priority(transcript)
        assigned_to = assign_responsible(category, transcript)

        return AudioTranscriptionResponse(
            transcript=transcript,
            language=getattr(info, "language", None),
            category=category,
            confidence=round(confidence, 3),
            priority=priority,
            assigned_to=assigned_to,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
