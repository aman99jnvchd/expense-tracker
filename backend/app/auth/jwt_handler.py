from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.config import settings
from fastapi import HTTPException, status

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if datetime.now(timezone.utc) > datetime.fromtimestamp(payload["exp"], tz=timezone.utc):
            raise JWTError("Token expired")
        # return payload
        return payload.get("sub")
    except JWTError as e:
        raise Exception("Invalid token")
