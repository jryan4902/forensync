from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import cases

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ForenSync API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router)


@app.get("/health")
def health():
    return {"status": "ok"}
