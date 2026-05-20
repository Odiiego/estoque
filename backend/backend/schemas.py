from pydantic import BaseModel


class UserSchema(BaseModel):
    nome: str
    senha: str

class UserPublic(BaseModel):
    id: int
    nome: str