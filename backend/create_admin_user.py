"""
관리자 사용자 생성 스크립트
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import async_session_maker, init_db
from app.models.user import User


async def create_admin_user():
    """관리자 사용자 생성"""
    await init_db()

    async with async_session_maker() as session:
        # 기존 관리자 계정 확인
        result = await session.execute(
            select(User).filter(User.email == "admin@fridgechef.com")
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print("⚠️  관리자 계정이 이미 존재합니다.")
            print(f"   ID: {existing_admin.id}")
            print(f"   이름: {existing_admin.name}")
            print(f"   이메일: {existing_admin.email}")
            return existing_admin.id

        # 관리자 계정 생성
        admin_user = User(
            email="admin@fridgechef.com",
            name="관리자",
            is_admin=True,
            preferences={}
        )

        session.add(admin_user)
        await session.commit()
        await session.refresh(admin_user)

        print("✅ 관리자 계정이 생성되었습니다!")
        print(f"   ID: {admin_user.id}")
        print(f"   이름: {admin_user.name}")
        print(f"   이메일: {admin_user.email}")
        print(f"\n💡 이 ID를 사용하여 로그인하세요: {admin_user.id}")

        return admin_user.id


if __name__ == "__main__":
    asyncio.run(create_admin_user())
