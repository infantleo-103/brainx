from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.crud.crud_batch import batch as crud_batch, batch_member as crud_batch_member
from app.crud.crud_course import course as crud_course # To check course existence
from app.crud.crud_user import user as crud_user
from app.models.user import User
from app.schemas.batch import Batch, BatchCreate, BatchUpdate, BatchMember, BatchMemberCreate, BatchDetail, BatchMemberDetail
from app.schemas.chat import ChatCreate, ChatMemberCreate, MessageCreate
from app.models.chat import ChatTypeEnum, ChatMemberRoleEnum
from app.crud.crud_chat import chat as crud_chat, message as crud_message
# Force reload for UUID fix

router = APIRouter()

# --- Batch Endpoints ---

@router.get("/", response_model=List[Batch])
async def read_batches(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve batches.
    """
    batches = await crud_batch.get_multi(db, skip=skip, limit=limit)
    return batches

@router.post("/", response_model=Batch)
async def create_batch(
    *,
    db: AsyncSession = Depends(deps.get_db),
    batch_in: BatchCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new batch.
    """
    # Check if course exists
    course = await crud_course.get(db, id=batch_in.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    batch = await crud_batch.create(db=db, obj_in=batch_in)

    # Automatic Chat Creation
    try:
        # Map batch members to chat members
        # Map batch members to chat members
        initial_chat_members = []
        
        # Add Teacher if assigned
        if batch_in.teacher_id:
            teacher = await crud_user.get(db, id=batch_in.teacher_id)
            if teacher:
                initial_chat_members.append(
                    ChatMemberCreate(
                        user_id=teacher.id,
                        role=ChatMemberRoleEnum.teacher,
                        role_id=None
                    )
                )

        if batch_in.members:
            for bm in batch_in.members:
                # Default role to student if not specified, or map appropriately
                # For now assuming 'student' role for batch members in chat
                initial_chat_members.append(
                    ChatMemberCreate(
                        user_id=bm.user_id,
                        role=ChatMemberRoleEnum.student,
                        role_id=bm.role_id
                    )
                )

        chat_in = ChatCreate(
            chat_type=ChatTypeEnum.group,
            batch_id=batch.id,
            is_official=True,
            initial_members=initial_chat_members
        )
        chat = await crud_chat.create(db=db, obj_in=chat_in, created_by=current_user.id)

        # Welcome Message
        msg_in = MessageCreate(
            chat_id=chat.id,
            batch_id=batch.id,
            message="HI this is chat our group",
            is_system_message=True
        )
        await crud_message.create(db=db, obj_in=msg_in, sender_id=current_user.id)
    except Exception as e:
        print(f"Failed to create auto-chat for batch {batch.id}: {e}")
        raise e # Debugging: Raise to see error in response

    return batch

from uuid import UUID

@router.get("/{batch_id}", response_model=BatchDetail)
async def read_batch(
    *,
    db: AsyncSession = Depends(deps.get_db),
    batch_id: UUID,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get batch by ID.
    """
    batch = await crud_batch.get_with_members(db=db, id=batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    # Manual mapping to schema
    members_details = [
        BatchMemberDetail(
            user_id=m.user_id,
            user_name=m.user.full_name if m.user else "Unknown",
            user_email=m.user.email if m.user else "Unknown",
            role_id=m.role_id
        )
        for m in batch.members
    ]
    
    batch_detail = BatchDetail(
        id=batch.id,
        course_id=batch.course_id,
        batch_name=batch.batch_name,
        teacher_id=batch.teacher_id,
        start_date=batch.start_date,
        end_date=batch.end_date,
        total_hours=batch.total_hours,
        consumed_hours=batch.consumed_hours,
        remaining_hours=batch.remaining_hours,
        schedule_time=batch.schedule_time,
        status=batch.status,
        created_at=batch.created_at,
        teacher_name=batch.teacher.full_name if batch.teacher else None,
        members=members_details
    )
    return batch_detail

from app.models.chat import ChatTypeEnum, ChatMemberRoleEnum
from app.crud.crud_chat import chat as crud_chat, message as crud_message
from app.schemas.chat import ChatCreate, ChatMemberCreate, MessageCreate

@router.put("/{batch_id}", response_model=Batch)
async def update_batch(
    *,
    db: AsyncSession = Depends(deps.get_db),
    batch_id: UUID,
    batch_in: BatchUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a batch.
    """
    batch = await crud_batch.get(db=db, id=batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # 1. Update Batch
    batch = await crud_batch.update(db, db_obj=batch, obj_in=batch_in)
    
    # 2. Sync Chat
    # Fetch full batch with members to ensure we have latest list
    batch = await crud_batch.get_with_members(db=db, id=batch.id)
    
    # Check if chat exists
    chat = await crud_chat.get_by_batch(db, batch_id=batch.id)
    
    if not chat:
        # Create new chat if it doesn't exist (Legacy batches)
        try:
            initial_chat_members = []
            
            # Add Teacher
            if batch.teacher_id:
                initial_chat_members.append(
                    ChatMemberCreate(
                        user_id=batch.teacher_id,
                        role=ChatMemberRoleEnum.teacher,
                        role_id=None 
                    )
                )
            
            # Add Members
            if batch.members:
                for bm in batch.members:
                    # Map BatchMemberRole to ChatMemberRoleEnum if needed, or assume string match
                    # BatchMemberRole has 'student', 'teacher', etc. same as ChatMemberRoleEnum
                    initial_chat_members.append(
                        ChatMemberCreate(
                            user_id=bm.user_id,
                            role=ChatMemberRoleEnum(bm.role.value) if hasattr(bm.role, 'value') else ChatMemberRoleEnum.student,
                            role_id=bm.role_id
                        )
                    )
            
            chat_in = ChatCreate(
                chat_type=ChatTypeEnum.group,
                batch_id=batch.id,
                is_official=True,
                initial_members=initial_chat_members
            )
            chat = await crud_chat.create(db=db, obj_in=chat_in, created_by=current_user.id)
             # Welcome Message
            msg_in = MessageCreate(
                chat_id=chat.id,
                batch_id=batch.id,
                message=f"Welcome to the group chat for {batch.batch_name}!",
                is_system_message=True
            )
            await crud_message.create(db=db, obj_in=msg_in, sender_id=current_user.id)
            
        except Exception as e:
            print(f"Failed to create auto-chat in update for batch {batch.id}: {e}")
            # Don't fail the update request if chat fails, just log it
    else:
        # Chat exists, sync members
        try:
            # Get current chat members
            # crud_chat.get_by_batch loads members
            current_member_ids = {m.user_id for m in chat.members}
            
            # Check Teacher
            if batch.teacher_id and batch.teacher_id not in current_member_ids:
                await crud_chat.add_member(
                    db, 
                    chat_id=chat.id, 
                    member_in=ChatMemberCreate(
                        user_id=batch.teacher_id,
                        role=ChatMemberRoleEnum.teacher
                    )
                )
                
            # Check Students
            for bm in batch.members:
                if bm.user_id not in current_member_ids:
                    await crud_chat.add_member(
                        db,
                        chat_id=chat.id,
                        member_in=ChatMemberCreate(
                            user_id=bm.user_id,
                            role=ChatMemberRoleEnum(bm.role.value) if hasattr(bm.role, 'value') else ChatMemberRoleEnum.student,
                            role_id=bm.role_id
                        )
                    )
        except Exception as e:
             print(f"Failed to sync chat members for batch {batch.id}: {e}")

    return batch

@router.delete("/{batch_id}", response_model=Batch)
async def delete_batch(
    *,
    db: AsyncSession = Depends(deps.get_db),
    batch_id: UUID,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a batch.
    """
    batch = await crud_batch.get(db=db, id=batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    batch = await crud_batch.remove(db, id=batch_id)
    return batch


# --- Batch Member Endpoints ---

@router.post("/{batch_id}/members/", response_model=BatchMember)
async def add_batch_member(
    *,
    db: AsyncSession = Depends(deps.get_db),
    batch_id: UUID,
    member_in: BatchMemberCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Add a member to a batch.
    """
    batch = await crud_batch.get(db=db, id=batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    # Ensure member_in.batch_id matches URL batch_id (or just override it)
    member_in.batch_id = batch_id
    
    # Check if already exists? (Omitted for brevity, but should be here)
    
    member = await crud_batch_member.create(db=db, obj_in=member_in)
    return member

@router.get("/{batch_id}/members/", response_model=List[BatchMember])
async def read_batch_members(
    *,
    db: AsyncSession = Depends(deps.get_db),
    batch_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get members of a batch.
    """
    batch = await crud_batch.get(db=db, id=batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    members = await crud_batch_member.get_by_batch(db, batch_id=batch_id, skip=skip, limit=limit)
    return members
