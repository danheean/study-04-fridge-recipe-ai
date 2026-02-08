"""
데모 사용자 생성 스크립트 (비밀번호 포함)

데모 계정:
    Email: demo@fridgechef.com
    Password: demo1234

사용법:
    python backend/create_demo_user.py
"""
import asyncio
from sqlalchemy import select
from app.db.database import AsyncSessionLocal, init_db
from app.models.user import User
from app.utils.security import hash_password


async def create_demo_user():
    """데모 사용자 생성 (비밀번호 포함)"""
    # DB 초기화
    await init_db()

    # 세션 생성
    async with AsyncSessionLocal() as db:
        try:
            # 데모 사용자 정보
            demo_email = "demo@fridgechef.com"
            demo_password = "demo1234"
            demo_name = "Demo User"

            # 이메일로 확인
            result = await db.execute(select(User).filter(User.email == demo_email))
            existing_user = result.scalar_one_or_none()

            if existing_user:
                if existing_user.password_hash:
                    print(f"✅ 데모 사용자가 이미 존재하며 비밀번호가 설정되어 있습니다.")
                    print(f"   - 이메일: {demo_email}")
                    print(f"   - 비밀번호: {demo_password}")
                else:
                    # 비밀번호만 업데이트
                    existing_user.password_hash = hash_password(demo_password)
                    await db.commit()
                    print(f"✅ 기존 데모 사용자에 비밀번호가 설정되었습니다.")
                    print(f"   - 이메일: {demo_email}")
                    print(f"   - 비밀번호: {demo_password}")
                return

            # 새로운 데모 사용자 생성
            demo_user = User(
                email=demo_email,
                name=demo_name,
                password_hash=hash_password(demo_password),
                is_admin=False,
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

            print(f"✅ 데모 사용자가 성공적으로 생성되었습니다!")
            print(f"   - 이메일: {demo_email}")
            print(f"   - 비밀번호: {demo_password}")
            print(f"   - ID: {demo_user.id}")

        except Exception as e:
            print(f"❌ 오류 발생: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(create_demo_user())
