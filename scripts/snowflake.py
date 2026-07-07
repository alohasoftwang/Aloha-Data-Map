"""雪花 ID 生成器（与 backend SnowflakeIdGenerator 参数一致，返回字符串）。"""

from __future__ import annotations

# 2024-01-01 00:00:00 UTC
EPOCH_MS = 1704067200000
# SQL 批量导入固定时间起点（约 2026-01-01），保证 id 为 18 位左右
SQL_IMPORT_START_DELTA_MS = 63_072_000_000

WORKER_ID_BITS = 5
DATACENTER_ID_BITS = 5
SEQUENCE_BITS = 12
MAX_SEQUENCE = (1 << SEQUENCE_BITS) - 1

WORKER_ID_SHIFT = SEQUENCE_BITS
DATACENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS
TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATACENTER_ID_BITS


def compose_id(delta_ms: int, datacenter_id: int, worker_id: int, sequence: int) -> str:
    value = (
        (delta_ms << TIMESTAMP_SHIFT)
        | (datacenter_id << DATACENTER_ID_SHIFT)
        | (worker_id << WORKER_ID_SHIFT)
        | sequence
    )
    return str(value)


class SnowflakeIdGenerator:
    """运行时雪花算法（按当前毫秒递增）。"""

    def __init__(self, worker_id: int = 1, datacenter_id: int = 1) -> None:
        if not 0 <= worker_id <= 31:
            raise ValueError("worker_id must be 0..31")
        if not 0 <= datacenter_id <= 31:
            raise ValueError("datacenter_id must be 0..31")
        self.worker_id = worker_id
        self.datacenter_id = datacenter_id
        self.sequence = 0
        self.last_timestamp = -1

    def next_id(self) -> str:
        import time

        timestamp = int(time.time() * 1000)
        if timestamp == self.last_timestamp:
            self.sequence = (self.sequence + 1) & MAX_SEQUENCE
            if self.sequence == 0:
                while timestamp <= self.last_timestamp:
                    timestamp = int(time.time() * 1000)
        else:
            self.sequence = 0
        self.last_timestamp = timestamp
        return compose_id(
            timestamp - EPOCH_MS,
            self.datacenter_id,
            self.worker_id,
            self.sequence,
        )


class DeterministicSnowflakeIdGenerator:
    """批量生成 SQL 用：固定起点顺序递增，每次重新生成结果一致。"""

    def __init__(self, worker_id: int = 1, datacenter_id: int = 1) -> None:
        self.worker_id = worker_id
        self.datacenter_id = datacenter_id
        self.delta_ms = SQL_IMPORT_START_DELTA_MS
        self.sequence = 0

    def next_id(self) -> str:
        snowflake_id = compose_id(
            self.delta_ms,
            self.datacenter_id,
            self.worker_id,
            self.sequence,
        )
        if self.sequence >= MAX_SEQUENCE:
            self.delta_ms += 1
            self.sequence = 0
        else:
            self.sequence += 1
        return snowflake_id
