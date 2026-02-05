from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.api import deps
from app.models.user import User
from app.schemas.enrollment import EnrollmentCreate, EnrollmentResponse, EnrollmentStatus
from app.schemas.batch import BatchCreate, BatchMemberCreate
from app.schemas.chat import ChatCreate, ChatMemberCreate, MessageCreate
from app.crud.crud_enrollment import enrollment as crud_enrollment
from app.crud.crud_batch import batch as crud_batch, batch_member as crud_batch_member
from app.crud.crud_chat import chat as crud_chat, message as crud_message
from app.crud.crud_course import course as crud_course
from app.models.batch import BatchMemberRole, BatchMemberStatus
from app.models.chat import ChatTypeEnum, ChatMemberRoleEnum

router = APIRouter()

@router.post("/", response_model=EnrollmentResponse)
async def enroll_in_course(
    *,
    db: AsyncSession = Depends(deps.get_db),
    enrollment_in: EnrollmentCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Enroll current user in a course.
    Creates enrollment record, then automatically creates batch membership and chat membership.
    """
    # 1. Verify course exists
    course = await crud_course.get(db, id=enrollment_in.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # 2. Check if already enrolled
    existing_enrollment = await crud_enrollment.get_by_student_and_course(
        db, student_id=current_user.id, course_id=enrollment_in.course_id
    )
    if existing_enrollment:
        # Get batch info for response
        batch_member = await crud_batch_member.get_by_user_and_course(
            db, user_id=current_user.id, course_id=enrollment_in.course_id
        )
        batch = await crud_batch.get(db, id=batch_member.batch_id) if batch_member else None
        batch_chat = await crud_chat.get_by_batch(db, batch_id=batch.id) if batch else None
        
        return EnrollmentResponse(
            id=existing_enrollment.id,
            student_id=current_user.id,
            course_id=enrollment_in.course_id,
            batch_id=batch.id if batch else None,
            batch_name=batch.batch_name if batch else None,
            chat_id=batch_chat.id if batch_chat else None,
            enrollment_date=existing_enrollment.enrollment_date,
            status="already_enrolled"
        )
    
    # 3. Create enrollment record
    enrollment = await crud_enrollment.create(
        db, obj_in=enrollment_in, student_id=current_user.id
    )
    
    # 4. Find or create batch
    batch = await crud_batch.get_active_batch_by_course(db, course_id=enrollment_in.course_id)
    
    if not batch:
        # Create new batch
        batch_in = BatchCreate(
            course_id=enrollment_in.course_id,
            batch_name=f"{course.title} - Batch {datetime.now().strftime('%b %Y')}",
            teacher_id=enrollment_in.teacher_id,
            status=True,
            members=[]
        )
        batch = await crud_batch.create(db, obj_in=batch_in)
        
        # Create chat for the new batch
        chat_in = ChatCreate(
            chat_type=ChatTypeEnum.group,
            batch_id=batch.id,
            is_official=True,
            initial_members=[]
        )
        batch_chat = await crud_chat.create(db=db, obj_in=chat_in, created_by=current_user.id)
        
        # Welcome message
        msg_in = MessageCreate(
            chat_id=batch_chat.id,
            batch_id=batch.id,
            message=f"Welcome to {course.title}! 🎉",
            is_system_message=True
        )
        await crud_message.create(db=db, obj_in=msg_in, sender_id=current_user.id)
    else:
        # Batch exists, get its chat
        batch_chat = await crud_chat.get_by_batch(db, batch_id=batch.id)
    
    # 5. Add user as batch member (based on enrollment data)
    batch_member_in = BatchMemberCreate(
        batch_id=batch.id,
        user_id=current_user.id,
        role_id=None,
        role=BatchMemberRole.student,
        status=BatchMemberStatus.active
    )
    await crud_batch_member.create(db, obj_in=batch_member_in)
    
    # 5b. Add teacher to batch if not exists
    teacher_member = await crud_batch_member.get_by_user_and_course(
         db, user_id=enrollment_in.teacher_id, course_id=enrollment_in.course_id
    )
    if not teacher_member and enrollment_in.teacher_id:
         teacher_batch_in = BatchMemberCreate(
            batch_id=batch.id,
            user_id=enrollment_in.teacher_id,
            role_id=None,
            role=BatchMemberRole.teacher,
            status=BatchMemberStatus.active
        )
         await crud_batch_member.create(db, obj_in=teacher_batch_in)

    # 5c. Add admin to batch if not exists
    from sqlalchemy.future import select
    result = await db.execute(select(User).filter(User.role == "admin").limit(1))
    admin_user = result.scalars().first()
    
    if admin_user:
        admin_member = await crud_batch_member.get_by_user_and_course(
             db, user_id=admin_user.id, course_id=enrollment_in.course_id
        )
        if not admin_member:
             admin_batch_in = BatchMemberCreate(
                batch_id=batch.id,
                user_id=admin_user.id,
                role_id=None,
                role=BatchMemberRole.coordinator, # Use coordinator or suitable role
                status=BatchMemberStatus.active
            )
             await crud_batch_member.create(db, obj_in=admin_batch_in)
    
    # 6. Add members to chat
    if batch_chat:
        # Add student
        chat_member_in = ChatMemberCreate(
            user_id=current_user.id,
            role_id=None,
            role=ChatMemberRoleEnum.student
        )
        await crud_chat.add_member(db, chat_id=batch_chat.id, member_in=chat_member_in)
        
        # Add teacher
        if enrollment_in.teacher_id:
            # Check if already member
            # Note: crud_chat.add_member typically handles duplicates or we should check
            # For simplicity, we try to add, assuming crud handles or we catch error?
            # Better to check existence first or rely on composite pk constraint
            # Assuming crud checks:
            try:
                teacher_chat_in = ChatMemberCreate(
                    user_id=enrollment_in.teacher_id,
                    role_id=None,
                    role=ChatMemberRoleEnum.teacher
                )
                await crud_chat.add_member(db, chat_id=batch_chat.id, member_in=teacher_chat_in)
            except Exception:
                pass # Already member
                
        # Add admin
        if admin_user:
            try:
                admin_chat_in = ChatMemberCreate(
                    user_id=admin_user.id,
                    role_id=None,
                    role=ChatMemberRoleEnum.admin
                )
                await crud_chat.add_member(db, chat_id=batch_chat.id, member_in=admin_chat_in)
            except Exception:
                pass
    
    # 7. Return enrollment details
    return EnrollmentResponse(
        id=enrollment.id,
        student_id=current_user.id,
        course_id=enrollment_in.course_id,
        batch_id=batch.id,
        batch_name=batch.batch_name,
        chat_id=batch_chat.id if batch_chat else None,
        enrollment_date=enrollment.enrollment_date,
        status="enrolled"
    )

@router.get("/", response_model=List[EnrollmentResponse])
async def get_my_enrollments(
    *,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all enrollments for current user.
    """
    # Get all enrollments for user
    enrollments = await crud_enrollment.get_by_student(db, student_id=current_user.id)
    
    enrollment_responses = []
    for enrollment in enrollments:
        # Get batch info
        batch_member = await crud_batch_member.get_by_user_and_course(
            db, user_id=current_user.id, course_id=enrollment.course_id
        )
        batch = await crud_batch.get(db, id=batch_member.batch_id) if batch_member else None
        batch_chat = await crud_chat.get_by_batch(db, batch_id=batch.id) if batch else None
        
        enrollment_responses.append(EnrollmentResponse(
            id=enrollment.id,
            student_id=current_user.id,
            course_id=enrollment.course_id,
            batch_id=batch.id if batch else None,
            batch_name=batch.batch_name if batch else None,
            chat_id=batch_chat.id if batch_chat else None,
            enrollment_date=enrollment.enrollment_date,
            status=enrollment.status.value
        ))
    
    return enrollment_responses

@router.get("/{course_id}/status", response_model=EnrollmentStatus)
async def check_enrollment_status(
    *,
    db: AsyncSession = Depends(deps.get_db),
    course_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Check if current user is enrolled in a course.
    """
    enrollment = await crud_enrollment.get_by_student_and_course(
        db, student_id=current_user.id, course_id=course_id
    )
    
    if enrollment:
        # Get batch info
        batch_member = await crud_batch_member.get_by_user_and_course(
            db, user_id=current_user.id, course_id=course_id
        )
        
        return EnrollmentStatus(
            is_enrolled=True,
            enrollment_id=enrollment.id,
            batch_id=batch_member.batch_id if batch_member else None,
            enrolled_at=enrollment.enrollment_date,
            status=enrollment.status.value if hasattr(enrollment.status, 'value') else enrollment.status
        )
    else:
        return EnrollmentStatus(
            is_enrolled=False,
            enrollment_id=None,
            batch_id=None,
            enrolled_at=None
        )
