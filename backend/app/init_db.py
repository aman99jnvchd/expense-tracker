from app.database import engine
from app.models import user, expense

def init_db():
    print("Creating tables...")
    user.Base.metadata.create_all(bind=engine)
    expense.Base.metadata.create_all(bind=engine)
    print("Done.")
