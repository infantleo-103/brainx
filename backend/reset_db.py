
import asyncio
import logging
from app.db.session import AsyncSessionLocal
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def reset_db():
    async with AsyncSessionLocal() as session:
        logger.info("Dropping public schema...")
        await session.execute(text("DROP SCHEMA public CASCADE;"))
        logger.info("Creating public schema...")
        await session.execute(text("CREATE SCHEMA public;"))
        await session.commit()
        logger.info("Database reset complete.")

if __name__ == "__main__":
    asyncio.run(reset_db())
