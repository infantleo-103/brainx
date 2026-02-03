
import asyncio
import logging
import uuid
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select, text

from app.db.session import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.role import Role
from app.models.permission import Permission
from app.models.provider import Provider
from app.models.course import Course, CourseCategory
from app.models.course_badge import CourseBadge
from app.models.batch import Batch, BatchMember, BatchMemberRole, BatchMemberStatus
from app.models.class_session import ClassSession

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_or_create_user(session, email, **kwargs):
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        user = User(email=email, **kwargs)
        session.add(user)
        logger.info(f"Creating user: {email}")
        await session.commit()
        await session.refresh(user)
    else:
        logger.info(f"User already exists: {email}")
    return user

async def get_or_create_provider(session, name, **kwargs):
    result = await session.execute(select(Provider).where(Provider.name == name))
    provider = result.scalars().first()
    if not provider:
        provider = Provider(name=name, **kwargs)
        session.add(provider)
        logger.info(f"Creating provider: {name}")
        await session.commit()
        await session.refresh(provider)
    else:
        logger.info(f"Provider already exists: {name}")
    return provider

async def get_or_create_category(session, name, **kwargs):
    result = await session.execute(select(CourseCategory).where(CourseCategory.name == name))
    category = result.scalars().first()
    if not category:
        category = CourseCategory(name=name, **kwargs)
        session.add(category)
        logger.info(f"Creating category: {name}")
        await session.commit()
        await session.refresh(category)
    else:
        logger.info(f"Category already exists: {name}")
    return category

async def sync_sequences(session):
    tables = [
        "course_categories",
        "providers",
        "courses",
        "batches",
        "class_sessions",
        "batch_members"
    ]
    for table in tables:
        try:
            # Check if sequence exists (usually table_id_seq)
            # This logic assumes standard naming convention
            seq_name = f"{table}_id_seq"
            # We can also just run setval blindly and catch error if sequence doesn't exist
            sql = text(f"SELECT setval('{seq_name}', (SELECT MAX(id) FROM {table}));")
            await session.execute(sql)
            logger.info(f"Synced sequence for {table}")
        except Exception as e:
            logger.warning(f"Could not sync sequence for {table}: {e}")
    await session.commit()

async def seed_data():
    async with AsyncSessionLocal() as session:
        await sync_sequences(session)
        
        # Create Providers
        provider1 = await get_or_create_provider(session, "TechEd Solutions", description="Top tech education provider")
        provider2 = await get_or_create_provider(session, "Science Wizards", description="Science related courses")
        
        # Create Categories
        cat1 = await get_or_create_category(session, "Programming", description="Coding and Software Development")
        cat2 = await get_or_create_category(session, "Data Science", description="Analytics and ML")
        
        # Create Users
        password = get_password_hash("password123")
        
        admin = await get_or_create_user(
            session, "admin@example.com",
            full_name="Admin User",
            password_hash=password,
            role=UserRole.admin,
            status=True
        )
        
        teacher = await get_or_create_user(
            session, "teacher@example.com",
            full_name="John Teacher",
            password_hash=password,
            role=UserRole.teacher,
            status=True
        )

        coordinator = await get_or_create_user(
            session, "coordinator@example.com",
            full_name="Alice Coordinator",
            password_hash=password,
            role=UserRole.coordinator,
            status=True
        )
        
        student1 = await get_or_create_user(
            session, "student1@example.com",
            full_name="Tom Student",
            password_hash=password,
            role=UserRole.student,
            status=True
        )
        
        student2 = await get_or_create_user(
            session, "student2@example.com",
            full_name="Jane Student",
            password_hash=password,
            role=UserRole.student,
            status=True
        )
        
        # Create Courses
        # Check if course exists by title
        result = await session.execute(select(Course).where(Course.title == "Python Mastery"))
        course1 = result.scalars().first()
        if not course1:
            course1 = Course(
                title="Python Mastery",
                description="Master Python from scratch",
                level="Beginner",
                duration_hours=40,
                duration_weeks=4,
                category_id=cat1.id,
                provider_id=provider1.id,
                status=True
            )
            session.add(course1)
            await session.commit()
            await session.refresh(course1)
            logger.info("Created Course: Python Mastery")
        
        result = await session.execute(select(Course).where(Course.title == "Data Science 101"))
        course2 = result.scalars().first()
        if not course2:
            course2 = Course(
                title="Data Science 101",
                description="Intro to Data Science",
                level="Intermediate",
                duration_hours=60,
                duration_weeks=6,
                category_id=cat2.id,
                provider_id=provider2.id,
                status=True
            )
            session.add(course2)
            await session.commit()
            await session.refresh(course2)
            logger.info("Created Course: Data Science 101")

        # Create Batches
        result = await session.execute(select(Batch).where(Batch.batch_name == "Python-Oct-2023"))
        batch1 = result.scalars().first()
        if not batch1:
            batch1 = Batch(
                course_id=course1.id,
                batch_name="Python-Oct-2023",
                teacher_id=teacher.id,
                start_date=date.today(),
                end_date=date.today() + timedelta(days=30),
                status=True
            )
            session.add(batch1)
            await session.commit()
            await session.refresh(batch1)
            logger.info("Created Batch: Python-Oct-2023")

        # Assign Students to Batch
        # Check if member exists
        result = await session.execute(select(BatchMember).where(BatchMember.batch_id == batch1.id, BatchMember.user_id == student1.id))
        mem1 = result.scalars().first()
        if not mem1:
            mem1 = BatchMember(
                batch_id=batch1.id,
                user_id=student1.id,
                role=BatchMemberRole.student,
                status=BatchMemberStatus.active
            )
            session.add(mem1)
            logger.info("Added student1 to batch1")

        result = await session.execute(select(BatchMember).where(BatchMember.batch_id == batch1.id, BatchMember.user_id == student2.id))
        mem2 = result.scalars().first()
        if not mem2:
            mem2 = BatchMember(
                batch_id=batch1.id,
                user_id=student2.id,
                role=BatchMemberRole.student,
                status=BatchMemberStatus.active
            )
            session.add(mem2)
            logger.info("Added student2 to batch1")
        
        await session.commit()
        
        # Create Class Session
        # Check if any session exists for this batch
        result = await session.execute(select(ClassSession).where(ClassSession.batch_id == batch1.id))
        sess1 = result.scalars().first()
        if not sess1:
            sess1 = ClassSession(
                batch_id=batch1.id,
                course_id=course1.id,
                teacher_id=teacher.id,
                start_time=datetime.now(timezone.utc) + timedelta(days=1),
                end_time=datetime.now(timezone.utc) + timedelta(days=1, hours=1),
                is_recorded=False
            )
            session.add(sess1)
            logger.info("Created Sample Class Session")
        
        await session.commit()
        logger.info("Data seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
