extends Control

@onready var balance_label = $VBoxContainer/TopHUD/BalanceLabel
@onready var dolphin_button = $VBoxContainer/Tabs/TabDolphins/DolphinCharacter

@onready var tabs = {
    "MARKET": $VBoxContainer/Tabs/TabMarket,
    "EGGS": $VBoxContainer/Tabs/TabEggs,
    "DOLPHINS": $VBoxContainer/Tabs/TabDolphins,
    "GODS": $VBoxContainer/Tabs/TabGods,
    "TASKS": $VBoxContainer/Tabs/TabTasks
}

func _ready():
    GameManager.balance_updated.connect(update_hud)
    GameManager.error_occurred.connect(show_toast)
    update_hud()
    switch_tab("DOLPHINS")

func update_hud():
    if balance_label:
        balance_label.text = "%.2f DMD\n%d Corn" % [GameManager.dmd_tokens, GameManager.corn]

func switch_tab(tab_name: String):
    for key in tabs:
        if tabs[key]: tabs[key].visible = (key == tab_name)

func show_toast(msg: String):
    print("TOAST: ", msg)

# Attached to UI Buttons via signals
func _on_nav_pressed(tab_name: String):
    switch_tab(tab_name)
