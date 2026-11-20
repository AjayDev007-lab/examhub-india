import pytest
import asyncio
from app.initial_data import seed_database

@pytest.fixture(scope="session", autouse=True)
def anyio_backend():
    return "asyncio"

@pytest.fixture(scope="session", autouse=True)
def init_test_db():
    asyncio.run(seed_database())
