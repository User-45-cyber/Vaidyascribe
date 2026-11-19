"""
Rate limiter utility — retry decorator for Groq API rate-limit errors.
"""

import time
from functools import wraps


def retry_on_rate_limit(max_retries: int = 3, wait_seconds: int = 30):
    """
    Decorator that retries a function call if a rate-limit error is raised.
    Waits `wait_seconds` between retries.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    error_msg = str(e).lower()
                    is_rate_limit = "rate_limit" in error_msg or "429" in error_msg
                    if is_rate_limit and attempt < max_retries - 1:
                        time.sleep(wait_seconds)
                    else:
                        raise
        return wrapper
    return decorator
