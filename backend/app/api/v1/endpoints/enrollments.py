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
    Creates only the enrollment record. Batch and chat management is handled separately.
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
        return EnrollmentResponse(
            id=existing_enrollment.id,
            student_id=current_user.id,
            course_id=enrollment_in.course_id,
            batch_id=None,
            batch_name=None,
            chat_id=None,
            enrollment_date=existing_enrollment.enrollment_date,
            status="already_enrolled"
        )
    
    # 3. Create enrollment record
    enrollment = await crud_enrollment.create(
        db, obj_in=enrollment_in, student_id=current_user.id
    )
    
    # 4. Return enrollment details
    return EnrollmentResponse(
        id=enrollment.id,
        student_id=current_user.id,
        course_id=enrollment_in.course_id,
        batch_id=None,
        batch_name=None,
        chat_id=None,
        enrollment_date=enrollment.enrollment_date,
        status="requested"  # Pending admin approval
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
    course_id: str,
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
            enrolled_at=enrollment.enrollment_date
        )
    else:
        return EnrollmentStatus(
            is_enrolled=False,
            enrollment_id=None,
            batch_id=None,
            enrolled_at=None
        )
