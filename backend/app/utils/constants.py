# WebSocket event types
CHAT_MESSAGE = "chat_message"
TYPING_START = "typing_start"
TYPING_STOP = "typing_stop"
READ_RECEIPT = "read_receipt"
SECURITY_BANNER = "security_banner"
SYSTEM_MESSAGE = "system_message"
ENCRYPTION_STATUS = "encryption_status"
TELEMETRY_UPDATE = "telemetry_update"
USER_STATUS = "user_status"
DELIVERY_CONFIRMATION = "delivery_confirmation"

# Encryption Lanes
LANE_STANDARD = "standard"
LANE_CRITICAL = "critical"

# Redis Keys
KEY_POOL = "qkd:keys"
KEY_POOL_SET_KEY = "qkd:available_keys"
PRIORITY_QUEUE_KEY = "pq:critical:queue"
ONLINE_STATUS = "status:online:"
TYPING = "typing:"

# Heuristic routing constants
DEFAULT_W1 = 0.4
DEFAULT_W2 = 0.3
DEFAULT_W3 = 0.3
DEFAULT_THREAT_THRESHOLD = 0.7
