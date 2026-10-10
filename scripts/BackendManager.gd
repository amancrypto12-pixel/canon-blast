extends Node

# Abstract Backend Manager for Production
var is_online: bool = false
var api_url = "https://api.yourgame.com/v1"

func _ready():
    pass

func sync_with_server():
    print("Syncing with backend...")
    # Dummy async response
    await get_tree().create_timer(1.0).timeout
    is_online = true
    print("Backend synced (Dummy).")

func send_tap_event(dolphin_id: String, cost: int):
    # Abstract method to send tap events to prevent client hacking
    # In production, this creates an HTTPRequest to your API
    print("Sending tap to backend. Dolphin: ", dolphin_id, " Cost: ", cost)
