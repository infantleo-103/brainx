from typing import List, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.response import APIResponse
from app.services.user_service import user_service

router = APIRouter()

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.crud.crud_user import user as crud_user

# get_db moved to deps.py

@router.post("/", response_model=APIResponse[UserResponse])
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    created_user = await user_service.create_new_user(db=db, user_in=user)
    return APIResponse(
        status_code=200,
        message="User created successfully",
        data=created_user
    )

@router.get("/", response_model=APIResponse[List[UserResponse]])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = await user_service.get_users(db, skip=skip, limit=limit)
    return APIResponse(
        status_code=200,
        message="Users retrieved successfully",
        data=users
    )

@router.get("/search", response_model=APIResponse[List[UserResponse]])
async def search_users(
    q: str,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search users by name, email, or phone number.
    """
    users = await user_service.search_users(db, query=q, skip=skip, limit=limit)
    return APIResponse(
        status_code=200,
        message="Users found successfully",
        data=users
    )

from app.schemas.user import UserWithPermissions
from app.crud.crud_role import role as crud_role

@router.get("/me", response_model=APIResponse[UserWithPermissions])
async def read_user_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get current user with permissions.
    """
    # Try to find the role by name in the DB to get permissions
    # User.role is an enum with values like "admin", "student"
    role_name = current_user.role.value
    
    role_obj = await crud_role.get_by_name(db, name=role_name)
    if not role_obj:
        # Try capitalized version (e.g., "Admin")
        role_obj = await crud_role.get_by_name(db, name=role_name.capitalize())
        
    permissions = []
    if role_obj:
        permissions = role_obj.permissions
        
    # Create response object
    # Pydantic v2 uses model_validate for ORM objects
    user_response = UserWithPermissions.model_validate(current_user)
    user_response.permissions = permissions
    
    return APIResponse(
        status_code=200,
        message="Current user retrieved successfully",
        data=user_response
    )

@router.put("/me", response_model=APIResponse[UserResponse])
async def update_user_me(
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update current user profile.
    """
    updated_user = await user_service.update_user(db, user=current_user, user_in=user_in)
    return APIResponse(
        status_code=200,
        message="User updated successfully",
        data=updated_user
    )

@router.put("/{user_id}", response_model=APIResponse[UserResponse])
async def update_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_id: UUID,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
):
    """
    Update a user.
    """
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await crud_user.update(db, db_obj=user, obj_in=user_in)
    return APIResponse(
        status_code=200,
        message="User updated successfully",
        data=updated_user
    )

@router.delete("/{user_id}", response_model=APIResponse[UserResponse])
async def delete_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_id: UUID,
    current_user: User = Depends(get_current_user),
):
    """
    Delete a user.
    """
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    deleted_user = await crud_user.remove(db, id=user_id)
    return APIResponse(
        status_code=200,
        message="User deleted successfully",
        data=deleted_user
    )

@router.get("/{user_id}/profile")
async def get_user_profile(
    *,
    db: AsyncSession = Depends(get_db),
    user_id: UUID,
    current_user: User = Depends(get_current_user),
):
    """
    Get comprehensive user profile with role-specific data.
    Returns different data based on user role: teacher, student, or parent.
    """
    from app.crud.crud_batch import batch as crud_batch
    from app.crud.crud_enrollment import enrollment as crud_enrollment
    from app.crud.crud_parent_student import parent_student as crud_parent_student
    from app.schemas.user import UserResponse
    from app.models.user import UserRole
    
    # Get user
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert user to schema for serialization
    user_data = UserResponse.model_validate(user)
    
    # Build role-specific data
    role_data = {}
    
    if user.role == UserRole.teacher:
        # Get teacher's batches
        batches = await crud_batch.get_by_teacher(db, teacher_id=user_id)
        
        unique_courses = set()
        total_students = 0
        batches_data = []
        
        for batch in batches:
            if batch.course_id:
                unique_courses.add(batch.course_id)
            if batch.members:
                total_students += len(batch.members)
            
            batches_data.append({
                "id": str(batch.id),
                "batch_name": batch.batch_name,
                "course_id": str(batch.course_id) if batch.course_id else None,
                "start_date": str(batch.start_date) if batch.start_date else None,
                "end_date": str(batch.end_date) if batch.end_date else None,
                "total_hours": batch.total_hours,
                "schedule_time": batch.schedule_time,
                "status": batch.status,
                "course": {
                    "id": str(batch.course.id),
                    "title": batch.course.title
                } if batch.course else None,
                "student_count": len(batch.members) if batch.members else 0
            })
        
        role_data = {
            "batches": batches_data,
            "total_batches": len(batches),
            "total_courses": len(unique_courses),
            "total_students": total_students
        }
    
    elif user.role == UserRole.student:
        # Get student's enrollments and batch memberships
        enrollments = await crud_enrollment.get_by_student(db, student_id=user_id)
        batches = await crud_batch.get_by_student(db, user_id=user_id)
        
        enrollments_data = []
        for enrollment in enrollments:
            enrollments_data.append({
                "id": str(enrollment.id),
                "course_id": str(enrollment.course_id),
                "course_title": enrollment.course.title if enrollment.course else None,
                "status": enrollment.status.value if enrollment.status else None,
                "enrollment_date": str(enrollment.enrollment_date) if enrollment.enrollment_date else None
            })
        
        batches_data = []
        for batch in batches:
            batches_data.append({
                "id": str(batch.id),
                "batch_name": batch.batch_name,
                "course_title": batch.course.title if batch.course else None,
                "teacher_name": batch.teacher.full_name if batch.teacher else None,
                "schedule_time": batch.schedule_time,
                "start_date": str(batch.start_date) if batch.start_date else None,
                "end_date": str(batch.end_date) if batch.end_date else None
            })
        
        role_data = {
            "enrollments": enrollments_data,
            "batches": batches_data,
            "total_enrollments": len(enrollments),
            "total_batches": len(batches)
        }
    
    elif user.role == UserRole.parent:
        # Get parent's children
        children_users = await crud_parent_student.get_students_by_parent(db, parent_id=user_id)
        
        children_data = []
        for child in children_users:
            # Get child's enrollments and batches
            child_enrollments = await crud_enrollment.get_by_student(db, student_id=child.id)
            child_batches = await crud_batch.get_by_student(db, user_id=child.id)
            
            child_enrollments_data = [{
                "course_title": e.course.title if e.course else None,
                "status": e.status.value if e.status else None
            } for e in child_enrollments]
            
            child_batches_data = [{
                "batch_name": b.batch_name,
                "course_title": b.course.title if b.course else None
            } for b in child_batches]
            
            children_data.append({
                "student_id": str(child.id),
                "student_name": child.full_name,
                "student_email": child.email,
                "enrollments": child_enrollments_data,
                "batches": child_batches_data,
                "total_courses": len(set([e.course_id for e in child_enrollments if e.course_id]))
            })
        
        role_data = {
            "children": children_data,
            "total_children": len(children_users)
        }
    
    return APIResponse(
        status_code=200,
        message="User profile retrieved successfully",
        data={
            "user": user_data,
            "role_data": role_data
        }
    )



