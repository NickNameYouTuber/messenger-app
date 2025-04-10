# Он же стример в нашей терминологии
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix='/admin', tags=['ADMIN'])

@router.get('/all')
def read_admins():
    return { "admins" :  ["admin1", "admin2"]}

