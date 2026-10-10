extends Node

signal balance_updated
signal dolphin_updated
signal error_occurred(msg: String)

var corn: int = 1000
var dmd_tokens: float = 0.0
var active_dolphin_index = 0

var inventory = [
    { "id": "nft_01", "rarity": "COMMON", "level": 1, "taps": 0 }
]

func _ready():
    SaveManager.load_game()
    BackendManager.sync_with_server()

func get_active_dolphin() -> Dictionary:
    if inventory.size() > 0:
        return inventory[active_dolphin_index]
    return {}

func feed_active_dolphin() -> bool:
    var dolphin = get_active_dolphin()
    if dolphin.is_empty(): return false
    
    var cost = calculate_feed_cost(dolphin.rarity, dolphin.level, dolphin.taps)
    if corn >= cost:
        # Optimistic UI update
        corn -= cost
        dmd_tokens += get_reward(dolphin.rarity)
        dolphin.taps += 1
        
        balance_updated.emit()
        dolphin_updated.emit()
        SaveManager.save_game()
        
        # Send to backend
        BackendManager.send_tap_event(dolphin.id, cost)
        return true
    else:
        error_occurred.emit("Not enough Corn!")
        return false

func calculate_feed_cost(rarity: String, level: int, current_taps: int) -> int:
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
