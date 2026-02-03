from typing import List, Optional, Union, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.provider import Provider
from app.schemas.provider import ProviderCreate, ProviderUpdate

class CRUDProvider:
    async def get(self, db: AsyncSession, id: int) -> Optional[Provider]:
        result = await db.execute(select(Provider).filter(Provider.id == id))
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[Provider]:
        result = await db.execute(select(Provider).offset(skip).limit(limit))
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: ProviderCreate) -> Provider:
        db_obj = Provider(
            name=obj_in.name,
            logo_url=obj_in.logo_url,
            description=obj_in.description,
            status=obj_in.status,
            css_class_name=obj_in.css_class_name
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, *, db_obj: Provider, obj_in: Union[ProviderUpdate, Dict[str, Any]]) -> Provider:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, *, id: int) -> Optional[Provider]:
        result = await db.execute(select(Provider).filter(Provider.id == id))
        obj = result.scalars().first()
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj

provider = CRUDProvider()
