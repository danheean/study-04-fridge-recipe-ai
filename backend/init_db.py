"""
데이터베이스 초기화 및 테스트 데이터 생성 스크립트
"""
import asyncio
from sqlalchemy import select
from app.db.database import AsyncSessionLocal, init_db, engine
from app.models.user import User
from app.models.recipe import SavedRecipe
from app.models.ingredient import Ingredient
from app.models.image_upload import ImageUpload


async def reset_database():
    """데이터베이스 테이블 삭제 및 재생성"""
    print("🗑️  기존 테이블 삭제 중...")

    # 모든 테이블 삭제
    from app.db.database import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    print("✅ 기존 테이블 삭제 완료")

    # 테이블 재생성
    print("🔨 새 테이블 생성 중...")
    await init_db()
    print("✅ 새 테이블 생성 완료")


async def create_test_user():
    """테스트 사용자 생성"""
    async with AsyncSessionLocal() as db:
        try:
            # 데모 사용자 생성
            demo_user = User(
                id="demo-user-123",
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

            print(f"✅ 테스트 사용자 생성 완료:")
            print(f"   ID: {demo_user.id}")
            print(f"   이름: {demo_user.name}")
            print(f"   이메일: {demo_user.email}")

            return demo_user.id

        except Exception as e:
            print(f"❌ 사용자 생성 실패: {e}")
            await db.rollback()
            return None


async def create_sample_recipes(user_id: str):
    """샘플 레시피 생성"""
    async with AsyncSessionLocal() as db:
        try:
            # 샘플 레시피 1
            recipe1 = SavedRecipe(
                user_id=user_id,
                title="김치볶음밥",
                description="간단하고 맛있는 김치볶음밥",
                ingredients=[
                    {"name": "밥", "quantity": "2공기", "available": True},
                    {"name": "김치", "quantity": "1/2컵", "available": True},
                    {"name": "계란", "quantity": "2개", "available": True},
                    {"name": "참기름", "quantity": "1큰술", "available": True},
                ],
                instructions=[
                    "팬에 기름을 두르고 김치를 볶습니다.",
                    "밥을 넣고 함께 �볶습니다.",
                    "계란을 풀어 넣고 섞습니다.",
                    "참기름을 두르고 완성합니다.",
                ],
                cooking_time=15,
                difficulty="easy",
                calories=450
            )

            # 샘플 레시피 2
            recipe2 = SavedRecipe(
                user_id=user_id,
                title="토마토 파스타",
                description="신선한 토마토로 만든 이탈리안 파스타",
                ingredients=[
                    {"name": "파스타면", "quantity": "200g", "available": True},
                    {"name": "토마토", "quantity": "4개", "available": True},
                    {"name": "마늘", "quantity": "3쪽", "available": True},
                    {"name": "올리브유", "quantity": "2큰술", "available": True},
                    {"name": "바질", "quantity": "약간", "available": False},
                ],
                instructions=[
                    "파스타면을 삶습니다.",
                    "팬에 올리브유와 마늘을 볶습니다.",
                    "토마토를 넣고 으깹니다.",
                    "삶은 면을 넣고 버무립니다.",
                    "바질을 올려 완성합니다.",
                ],
                cooking_time=25,
                difficulty="easy",
                calories=380
            )

            db.add(recipe1)
            db.add(recipe2)
            await db.commit()

            print(f"✅ 샘플 레시피 2개 생성 완료:")
            print(f"   1. {recipe1.title}")
            print(f"   2. {recipe2.title}")

        except Exception as e:
            print(f"❌ 레시피 생성 실패: {e}")
            await db.rollback()


async def verify_data():
    """데이터 확인"""
    async with AsyncSessionLocal() as db:
        try:
            # 사용자 수 확인
            result = await db.execute(select(User))
            users = result.scalars().all()
            print(f"\n📊 데이터베이스 상태:")
            print(f"   사용자: {len(users)}명")

            # 레시피 수 확인
            result = await db.execute(select(SavedRecipe))
            recipes = result.scalars().all()
            print(f"   저장된 레시피: {len(recipes)}개")

            # 상세 정보
            if users:
                print(f"\n👤 사용자 목록:")
                for user in users:
                    print(f"   - {user.name} ({user.email})")

            if recipes:
                print(f"\n🍳 레시피 목록:")
                for recipe in recipes:
                    print(f"   - {recipe.title} (조리시간: {recipe.cooking_time}분)")

        except Exception as e:
            print(f"❌ 데이터 확인 실패: {e}")


async def main():
    """메인 함수"""
    print("=" * 60)
    print("🚀 FridgeChef 데이터베이스 초기화 시작")
    print("=" * 60)

    # 1. 데이터베이스 초기화
    await reset_database()

    # 2. 테스트 사용자 생성
    print("\n" + "=" * 60)
    print("👤 테스트 사용자 생성")
    print("=" * 60)
    user_id = await create_test_user()

    if user_id:
        # 3. 샘플 레시피 생성 (선택)
        print("\n" + "=" * 60)
        print("🍳 샘플 레시피 생성")
        print("=" * 60)
        await create_sample_recipes(user_id)

    # 4. 데이터 확인
    print("\n" + "=" * 60)
    print("📊 최종 데이터 확인")
    print("=" * 60)
    await verify_data()

    print("\n" + "=" * 60)
    print("✅ 데이터베이스 초기화 완료!")
    print("=" * 60)
    print("\n💡 이제 백엔드 서버를 실행하세요:")
    print("   uvicorn app.main:app --reload --port 8000")


if __name__ == "__main__":
    asyncio.run(main())
