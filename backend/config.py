import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass
class Settings:
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
    openrouter_model: str = os.getenv(
        "OPENROUTER_MODEL", "nvidia/llama-nemotron-embed-vl-1b-v2"
    )
    openrouter_base_url: str = os.getenv(
        "OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"
    )
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    allowed_origins: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
    auto_optimize_interval_seconds: int = int(
        os.getenv("AUTO_OPTIMIZE_INTERVAL_SECONDS", "30")
    )
    traffic_stream_interval_seconds: int = int(
        os.getenv("TRAFFIC_STREAM_INTERVAL_SECONDS", "5")
    )

    @property
    def cors_origins(self) -> list[str]:
        return _split_csv(self.allowed_origins)


settings = Settings()
