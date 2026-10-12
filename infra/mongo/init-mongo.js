db = db.getSiblingDB('pqc_secure_comm');

db.createCollection('users');
db.createCollection('messages');
db.createCollection('qkd_keys');
db.createCollection('telemetry_events');

db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

db.messages.createIndex({ sender_id: 1, recipient_id: 1, created_at: 1 });
db.messages.createIndex({ created_at: 1 });

db.qkd_keys.createIndex({ consumed: 1, generated_at: 1 });
db.qkd_keys.createIndex({ generated_at: 1 });

db.telemetry_events.createIndex({ event_type: 1, timestamp: 1 });
db.telemetry_events.createIndex({ timestamp: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

if (!db.users.findOne({ username: 'admin' })) {
    db.users.insertOne({
        username: 'admin',
        email: 'admin@system.local',
        password_hash: '$argon2id$v=19$m=65536,t=3,p=4$2q9x/6u33Yg2L0+uXmF+Zw$1Q2VzF4o7vjN7yYqXqI5I9CqO2Q2s2eP1B2b4r9+48s', // password123
        priority: 10,
        display_name: 'System Admin',
        created_at: new Date()
    });
}
