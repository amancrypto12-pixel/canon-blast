extends Control

@onready var ui_balance = $VBoxContainer/TopBar/BalanceLabel
@onready var dolphin_button = $VBoxContainer/CenterContainer/DolphinButton
@onready var feed_button = $VBoxContainer/BottomBar/FeedButton

var taps = 0
var current_level = 1
var current_rarity = "COMMON"

func _ready():
    GameManager.balance_updated.connect(update_ui)
    feed_button.pressed.connect(_on_feed_button_pressed)
    update_ui()

func _on_feed_button_pressed():
    if GameManager.feed_dolphin(current_level, current_rarity, taps):
        taps += 1
        _show_floating_text("+0.01 DMD")
        update_ui()

func update_ui():
    ui_balance.text = str(GameManager.dmd_tokens) + " DMD | " + str(GameManager.corn) + " Corn"

func _show_floating_text(text: String):
    # Instantiate a floating text label and animate it
    var label = Label.new()
    label.text = text
    label.global_position = dolphin_button.global_position + Vector2(100, 100)
    add_child(label)
    
    var tween = create_tween()
    tween.tween_property(label, "position", label.global_position + Vector2(0, -50), 0.5)
    tween.tween_property(label, "modulate:a", 0.0, 0.5)
    tween.tween_callback(label.queue_free)
