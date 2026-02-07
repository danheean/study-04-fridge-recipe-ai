"""
구조화된 로깅 설정
"""
import logging
import sys
from typing import Optional


def setup_logger(
    name: str,
    level: int = logging.INFO,
    format_string: Optional[str] = None
) -> logging.Logger:
    """
    로거 설정 및 반환

    Args:
        name: 로거 이름
        level: 로그 레벨
        format_string: 로그 포맷 문자열

    Returns:
        설정된 로거
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # 이미 핸들러가 있으면 추가하지 않음 (중복 방지)
    if logger.handlers:
        return logger

    # 핸들러 생성
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)

    # 포맷 설정
    if format_string is None:
        format_string = (
            '%(asctime)s - %(name)s - %(levelname)s - '
            '%(funcName)s:%(lineno)d - %(message)s'
        )

    formatter = logging.Formatter(format_string)
    handler.setFormatter(formatter)

    logger.addHandler(handler)
    return logger


def get_logger(name: str) -> logging.Logger:
    """
    로거 가져오기 (없으면 생성)

    Args:
        name: 로거 이름

    Returns:
        로거
    """
    return setup_logger(name)
