from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.upload import router as upload_router
from routers.ai import router as ai_router
from routers.exam import router as exam_router
from routers.learning import router as learning_router
from routers import learning_quiz

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(upload_router)
app.include_router(ai_router)
app.include_router(exam_router)
app.include_router(
    learning_router
)
app.include_router(
    learning_quiz.router,
    prefix="/learning"
)

@app.get("/")
def home():
    return {"message": "Backend connected successfully!"}

    