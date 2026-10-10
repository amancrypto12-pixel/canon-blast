extends Node

const SAVE_PATH = "user://save_data.json"

func save_game():
    var data = {
        "corn": GameManager.corn,
        "dmd_tokens": GameManager.dmd_tokens,
        "inventory": GameManager.inventory,
        "active_dolphin_index": GameManager.active_dolphin_index
    }
    var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
    if file:
        file.store_string(JSON.stringify(data))

func load_game():
    if FileAccess.file_exists(SAVE_PATH):
        var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
        var json = JSON.new()
        var error = json.parse(file.get_as_text())
        if error == OK:
            var data = json.data
            GameManager.corn = data.get("corn", GameManager.corn)
            GameManager.dmd_tokens = data.get("dmd_tokens", GameManager.dmd_tokens)
            GameManager.inventory = data.get("inventory", GameManager.inventory)
            GameManager.active_dolphin_index = data.get("active_dolphin_index", GameManager.active_dolphin_index)
