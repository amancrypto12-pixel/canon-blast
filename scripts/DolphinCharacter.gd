extends TextureButton

var base_scale: Vector2 = Vector2.ONE
var is_animating: bool = false

func _ready():
    base_scale = scale
    start_idle_animation()

func start_idle_animation():
    var tween = create_tween().set_loops()
    tween.tween_property(self, "scale", base_scale * 1.05, 1.0).set_trans(Tween.TRANS_SINE)
    tween.tween_property(self, "scale", base_scale, 1.0).set_trans(Tween.TRANS_SINE)

func _pressed():
    if GameManager.feed_active_dolphin():
        play_squash_stretch()
        show_floating_text()

func play_squash_stretch():
    if is_animating: return
    is_animating = true
    var tween = create_tween()
    # Squash down
    tween.tween_property(self, "scale", Vector2(base_scale.x * 1.1, base_scale.y * 0.9), 0.1)
    # Stretch up
    tween.tween_property(self, "scale", Vector2(base_scale.x * 0.95, base_scale.y * 1.05), 0.1)
    # Back to normal
    tween.tween_property(self, "scale", base_scale, 0.1)
    tween.tween_callback(func(): is_animating = false)

func show_floating_text():
    var active = GameManager.get_active_dolphin()
    if active.is_empty(): return
    var reward = GameManager.get_reward(active.rarity)
    var cost = GameManager.calculate_feed_cost(active.rarity, active.level, active.taps)
    
    var lbl = Label.new()
    lbl.text = "+%.2f DMD\n-%d Corn" % [reward, cost]
    lbl.add_theme_font_size_override("font_size", 40)
    lbl.add_theme_color_override("font_color", Color.YELLOW)
    
    get_parent().add_child(lbl)
    lbl.global_position = global_position + (size / 2)
    
    var tween = create_tween()
    tween.tween_property(lbl, "position", lbl.global_position + Vector2(0, -100), 0.5)
    tween.tween_property(lbl, "modulate:a", 0.0, 0.5)
    tween.tween_callback(lbl.queue_free)
