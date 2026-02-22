"""MongoDB connection using Motor and Beanie"""

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.infrastructure.session.document import SessionDocument


async def init_db():
    """Initialize MongoDB connection and Beanie ODM"""
    # Create Motor client
    client = AsyncIOMotorClient(settings.mongodb_uri)

    # Initialize Beanie with the SessionDocument model
    await init_beanie(
        database=client[settings.mongodb_database_name],
        document_models=[SessionDocument],
    )
