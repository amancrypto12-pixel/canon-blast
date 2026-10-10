extends Node

signal balance_updated
signal stats_updated

var corn: float = 0.0 # using corn for feeding currency like the guide
var dmd_tokens: float = 0.0 # equivalent to pearls/DMD
var energy: int = 2000
var max_energy: int = 2000

# Constants based on the DuckMyDuck guide
const FEED_REWARD_COMMON = 0.01

func _ready():
    # Load saved data here
    pass

func feed_dolphin(level: int, rarity: String, current_taps: int) -> bool:
    var cost = calculate_feed_cost(rarity, level, current_taps)
    if corn >= cost:
        corn -= cost
        dmd_tokens += get_reward(rarity)
        balance_updated.emit()
        stats_updated.emit()
        return true
    return false

func calculate_feed_cost(rarity: String, level: int, current_taps: int) -> int:
    # Simplified logic from the guide
    # Example: COMMON lvl 1 costs 2 corn up to 20 taps, then increases
    var base_cost = 2
    if current_taps > 20: base_cost += 2
    if current_taps > 40: base_cost += 2
    return base_cost

func get_reward(rarity: String) -> float:
    match rarity:
        "COMMON": return 0.01
        "UNCOMMON": return 0.02
        "RARE": return 0.04
        "EPIC": return 0.5
        "LEGENDARY": return 1.6
    return 0.01
