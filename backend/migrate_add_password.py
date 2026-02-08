"""
데이터베이스 마이그레이션: User 테이블에 password_hash 컬럼 추가

사용법:
    python backend/migrate_add_password.py
"""
import asyncio
import sqlite3
from pathlib import Path


async def migrate_add_password_column():
    """User 테이블에 password_hash 컬럼 추가"""

    # 데이터베이스 파일 경로
    db_path = Path(__file__).parent.parent / "fridgechef.db"

    if not db_path.exists():
        print(f"❌ 데이터베이스 파일을 찾을 수 없습니다: {db_path}")
        print("ℹ️  먼저 애플리케이션을 실행하여 데이터베이스를 생성하세요.")
        return

    try:
        # SQLite 연결
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # 컬럼이 이미 존재하는지 확인
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]

        if "password_hash" in columns:
            print("✅ password_hash 컬럼이 이미 존재합니다. 마이그레이션이 필요하지 않습니다.")
        else:
            # password_hash 컬럼 추가 (nullable)
            print("🔄 password_hash 컬럼을 추가하는 중...")
            cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
            conn.commit()
            print("✅ password_hash 컬럼이 성공적으로 추가되었습니다!")

        # 통계 출력
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM users WHERE password_hash IS NOT NULL")
        users_with_password = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM users WHERE password_hash IS NULL")
        users_without_password = cursor.fetchone()[0]

        print("\n📊 사용자 통계:")
        print(f"   - 전체 사용자: {total_users}명")
        print(f"   - 비밀번호 설정됨: {users_with_password}명")
        print(f"   - 비밀번호 미설정 (마이그레이션 필요): {users_without_password}명")

        if users_without_password > 0:
            print("\nℹ️  기존 사용자는 /api/auth/reset-password 엔드포인트를 통해 비밀번호를 설정할 수 있습니다.")

        conn.close()
        print("\n✅ 마이그레이션 완료!")

    except Exception as e:
        print(f"❌ 마이그레이션 실패: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(migrate_add_password_column())
