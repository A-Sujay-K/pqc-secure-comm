# WebSocket event types
CHAT_MESSAGE = "chat_message"
TYPING_START = "typing_start"
TYPING_STOP = "typing_stop"
READ_RECEIPT = "read_receipt"
SECURITY_BANNER = "security_banner"
SYSTEM_MESSAGE = "system_message"
ENCRYPTION_STATUS = "encryption_status"
TELEMETRY_UPDATE = "telemetry_update"
KEY_POOL_UPDATE = "key_pool_update"

# Encryption lane identifiers
LANE_STANDARD = "standard"
LANE_CRITICAL = "critical"

# Redis key prefixes
KEY_POOL_PREFIX = "qkd:keys"
PRIORITY_QUEUE_KEY = "pq:critical"
ONLINE_STATUS_PREFIX = "status:online:"
TYPING_PREFIX = "typing:"

# Threat analyzer defaults (real values come from Settings)
DEFAULT_THREAT_THRESHOLD = 0.7
DEFAULT_W1 = 0.4
DEFAULT_W2 = 0.3
DEFAULT_W3 = 0.3
