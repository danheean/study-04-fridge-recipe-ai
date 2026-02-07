"""
데모 사용자 생성 스크립트
"""
import asyncio
from sqlalchemy import select
from app.db.database import AsyncSessionLocal, init_db
from app.models.user import User


async def create_demo_user():
    """데모 사용자 생성"""
    # DB 초기화
    await init_db()

    # 세션 생성
    async with AsyncSessionLocal() as db:
        try:
            # 데모 사용자 ID
            demo_user_id = "demo-user-123"

            # 이미 존재하는지 확인
            result = await db.execute(select(User).filter(User.id == demo_user_id))
            existing_user = result.scalar_one_or_none()

            if existing_user:
                print(f"✅ 데모 사용자가 이미 존재합니다: {existing_user.name} ({existing_user.id})")
                return

            # 새 사용자 생성
            demo_user = User(
                id=demo_user_id,
                email="demo@fridgechef.com",
                name="데모 사용자",
                preferences={
                    "dietary_restrictions": [],
                    "excluded_ingredients": [],
                    "favorite_cuisines": ["한식", "이탈리아", "일식"],
                    "allergies": []
                }
            )

            db.add(demo_user)
            await db.commit()
            await db.refresh(demo_user)

            print(f"✅ 데모 사용자가 생성되었습니다!")
            print(f"   ID: {demo_user.id}")
            print(f"   이름: {demo_user.name}")
            print(f"   이메일: {demo_user.email}")

        except Exception as e:
            print(f"❌ 오류 발생: {e}")
            await db.rollback()


if __name__ == "__main__":
    asyncio.run(create_demo_user())
