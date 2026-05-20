from fastapi import FastAPI
from http import HTTPStatus

from backend.schemas import UserPublic, UserSchema

app = FastAPI()

database = [] 

@app.get('/')
def read_root():
    return 'API de Estoque'

@app.post('/users/', status_code=HTTPStatus.CREATED, response_model=UserPublic)
def create_user(user: UserSchema):
    user_with_id = UserPublic(**user.model_dump(), id=len(database) + 1)  

    database.append(user_with_id)

    return user_with_id