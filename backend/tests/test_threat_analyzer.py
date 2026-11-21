import pytest
from app.core.threat_analyzer import compute_threat_level, compute_dynamic_threshold, determine_lane
from app.utils.constants import LANE_STANDARD, LANE_CRITICAL
from app.config import Settings

@pytest.fixture
def custom_settings():
    return Settings(
        W1=0.6,
        W2=0.4,
        K_MAX=20,
        TAU_MIN=0.4,
        TAU_MAX=0.8,
        S_CRIT=0.85,
        DELIVERY_DEADLINE=5.0
    )

@pytest.mark.asyncio
async def test_compute_threat_level(custom_settings):
    # S = 0.2, I = 4 -> I_norm = 0.4
    # QTL = 0.6 * 0.2 + 0.4 * 0.4 = 0.12 + 0.16 = 0.28
    qtl = await compute_threat_level(0.2, 4, 10, custom_settings)
    assert qtl == 0.28

@pytest.mark.asyncio
async def test_compute_dynamic_threshold(custom_settings):
    # Pool full: 20/20 -> a = 1.0 -> tau_eff = 0.4
    assert compute_dynamic_threshold(20, custom_settings) == 0.40
    # Pool half: 10/20 -> a = 0.5 -> tau_eff = 0.4 + 0.4 * 0.5 = 0.60
    assert compute_dynamic_threshold(10, custom_settings) == 0.60
    # Pool empty: 0/20 -> a = 0.0 -> tau_eff = 0.80
    assert compute_dynamic_threshold(0, custom_settings) == 0.80

@pytest.mark.asyncio
async def test_determine_lane_switching(custom_settings):
    # Case 1: QTL = 0.50, tau_eff = 0.60 -> STANDARD
    assert determine_lane(0.50, 0.60, 0.20, custom_settings.S_CRIT) == LANE_STANDARD
    
    # Case 2: QTL = 0.65, tau_eff = 0.60 -> CRITICAL
    assert determine_lane(0.65, 0.60, 0.50, custom_settings.S_CRIT) == LANE_CRITICAL
    
    # Case 3: QTL = 0.30, but S = 0.90 (>= S_CRIT 0.85) -> CRITICAL override!
    assert determine_lane(0.30, 0.80, 0.90, custom_settings.S_CRIT) == LANE_CRITICAL

def test_tiered_sensitivity_scoring():
    from app.utils.sensitivity import get_sensitivity_score
    # Low tier dynamic ranges
    s_low1 = get_sensitivity_score(None, "hello there team, let's schedule a meeting")
    s_low2 = get_sensitivity_score("team_photo.jpg", "routine photo")
    assert 0.10 <= s_low1 <= 0.35
    assert 0.15 <= s_low2 <= 0.35
    assert s_low1 != s_low2  # Ensures non-constant scoring
    
    # Medium tier dynamic ranges
    s_med1 = get_sensitivity_score(None, "please review the financial quarterly audit")
    s_med2 = get_sensitivity_score("quarterly_report.pdf", "report")
    assert 0.40 <= s_med1 <= 0.70
    assert 0.35 <= s_med2 <= 0.65
    assert s_med1 != s_med2  # Ensures non-constant scoring
    
    # High tier dynamic ranges
    s_high1 = get_sensitivity_score(None, "here is the password for the account")
    s_high2 = get_sensitivity_score("keys.env", "secret")
    assert 0.75 <= s_high1 <= 0.99
    assert 0.80 <= s_high2 <= 0.99
    
    # Multi-keyword compounding: multiple secrets elevate threat above single secret
    s_multi = get_sensitivity_score(None, "CRITICAL: urgent master key, root password, and secret api_key leaked")
    assert s_multi > s_high1
    
    # High security override
    s_hs = get_sensitivity_score(None, "ordinary message", high_security=True)
    assert s_hs >= 0.90
    
    # Ensures scores dynamically vary with respect to message content
    s_a = get_sensitivity_score(None, "Can we meet tomorrow at 10am?")
    s_b = get_sensitivity_score(None, "Here is the invoice and payroll budget")
    s_c = get_sensitivity_score(None, "Here is the master password and access_token")
    assert s_a < s_b < s_c
