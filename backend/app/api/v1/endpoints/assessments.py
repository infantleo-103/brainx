from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Any
from datetime import datetime

from app.api.deps import get_db
from app.models.assessment import Assessment
from app.schemas.assessment import AssessmentCreate, AssessmentResponse
from app.services.bunny_service import bunny_service
from app.models.course import Course
from app.models.batch import Batch

router = APIRouter()

@router.post("/", response_model=AssessmentResponse)
async def create_assessment(
    assessment_in: AssessmentCreate,
    db: AsyncSession = Depends(get_db)
):
    # Retrieve Course Name for filename
    result_course = await db.execute(select(Course).filter(Course.id == assessment_in.course_id))
    course = result_course.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    result_batch = await db.execute(select(Batch).filter(Batch.id == assessment_in.batch_id))
    batch = result_batch.scalars().first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    # Generate Filename: batch_id_coursename_timestamp.json
    safe_course_title = "".join(c for c in course.title if c.isalnum() or c in (' ', '_', '-')).rstrip()
    safe_course_title = safe_course_title.replace(" ", "_")
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{assessment_in.batch_id}_{safe_course_title}_{timestamp}.json"

    # Upload Questions to Bunny.net
    template_url = await bunny_service.upload_json(assessment_in.questions, filename)

    # Create Assessment Record in DB
    assessment = Assessment(
        course_id=assessment_in.course_id,
        batch_id=assessment_in.batch_id,
        title=assessment_in.title,
        type=assessment_in.type,
        total_marks=assessment_in.total_marks,
        due_date=assessment_in.due_date,
        template_url=template_url
    )
    
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    
    # Populate names for response
    assessment.course_name = course.title
    assessment.batch_name = batch.batch_name
    
    return assessment

@router.get("/", response_model=List[AssessmentResponse])
async def read_assessments(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    # Join with Course and Batch to get names
    stmt = select(Assessment, Course.title, Batch.batch_name)\
        .join(Course, Assessment.course_id == Course.id)\
        .join(Batch, Assessment.batch_id == Batch.id)\
        .offset(skip).limit(limit)
        
    result = await db.execute(stmt)
    rows = result.all()
    
    # Map results to AssessmentResponse
    response = []
    for assessment, course_title, batch_name in rows:
        assessment.course_name = course_title
        assessment.batch_name = batch_name
        response.append(assessment)
        
    return response

@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def read_assessment(
    assessment_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Assessment, Course.title, Batch.batch_name)\
        .join(Course, Assessment.course_id == Course.id)\
        .join(Batch, Assessment.batch_id == Batch.id)\
        .filter(Assessment.id == assessment_id)
        
    result = await db.execute(stmt)
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    assessment, course_title, batch_name = row
    assessment.course_name = course_title
    assessment.batch_name = batch_name
    
    return assessment
