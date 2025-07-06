/**
 * 資產載入器
 * 管理圖像、音效等資產的載入
 */
class AssetLoader {
    constructor() {
        this.assets = new Map();
        this.loadQueue = [];
        this.isLoading = false;
        this.loadedCount = 0;
        this.totalCount = 0;
        this.listeners = new Map();
    }

    // 添加圖像到載入隊列
    addImage(key, src) {
        this.loadQueue.push({
            type: 'image',
            key: key,
            src: src
        });
        this.totalCount++;
    }

    // 添加音效到載入隊列
    addAudio(key, src) {
        this.loadQueue.push({
            type: 'audio',
            key: key,
            src: src
        });
        this.totalCount++;
    }

    // 添加 JSON 資料到載入隊列
    addJSON(key, src) {
        this.loadQueue.push({
            type: 'json',
            key: key,
            src: src
        });
        this.totalCount++;
    }

    // 開始載入所有資產
    load() {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        this.loadedCount = 0;
        this.emit('loadStart');

        if (this.loadQueue.length === 0) {
            this.onLoadComplete();
            return;
        }

        // 並行載入所有資產
        const promises = this.loadQueue.map(item => this.loadAsset(item));
        
        Promise.all(promises)
            .then(() => {
                this.onLoadComplete();
            })
            .catch(error => {
                this.onLoadError(error);
            });
    }

    // 載入單個資產
    loadAsset(item) {
        return new Promise((resolve, reject) => {
            switch (item.type) {
                case 'image':
                    this.loadImage(item).then(resolve).catch(reject);
                    break;
                case 'audio':
                    this.loadAudio(item).then(resolve).catch(reject);
                    break;
                case 'json':
                    this.loadJSON(item).then(resolve).catch(reject);
                    break;
                default:
                    reject(new Error(`Unknown asset type: ${item.type}`));
            }
        });
    }

    // 載入圖像
    loadImage(item) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.assets.set(item.key, img);
                this.onAssetLoaded(item.key, 'image');
                resolve(img);
            };
            
            img.onerror = () => {
                console.warn(`Failed to load image: ${item.src}`);
                // 創建佔位符圖像而不是拒絕
                this.assets.set(item.key, null);
                this.onAssetLoaded(item.key, 'image');
                resolve(null);
            };
            
            img.src = item.src;
        });
    }

    // 載入音效
    loadAudio(item) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            
            audio.oncanplaythrough = () => {
                this.assets.set(item.key, audio);
                this.onAssetLoaded(item.key, 'audio');
                resolve(audio);
            };
            
            audio.onerror = () => {
                console.warn(`Failed to load audio: ${item.src}`);
                // 設定為 null 而不是拒絕
                this.assets.set(item.key, null);
                this.onAssetLoaded(item.key, 'audio');
                resolve(null);
            };
            
            audio.src = item.src;
            audio.load();
        });
    }

    // 載入 JSON 資料
    loadJSON(item) {
        return new Promise((resolve, reject) => {
            fetch(item.src)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    this.assets.set(item.key, data);
                    this.onAssetLoaded(item.key, 'json');
                    resolve(data);
                })
                .catch(error => {
                    console.warn(`Failed to load JSON: ${item.src} - ${error.message}`);
                    // 設定為 null 而不是拒絕
                    this.assets.set(item.key, null);
                    this.onAssetLoaded(item.key, 'json');
                    resolve(null);
                });
        });
    }

    // 單個資產載入完成
    onAssetLoaded(key, type) {
        this.loadedCount++;
        const progress = this.loadedCount / this.totalCount;
        
        this.emit('assetLoaded', {
            key: key,
            type: type,
            progress: progress,
            loaded: this.loadedCount,
            total: this.totalCount
        });
    }

    // 所有資產載入完成
    onLoadComplete() {
        this.isLoading = false;
        this.emit('loadComplete');
        console.log(`Successfully loaded ${this.loadedCount}/${this.totalCount} assets`);
    }

    // 載入錯誤
    onLoadError(error) {
        this.isLoading = false;
        this.emit('loadError', error);
        console.error('Asset loading failed:', error);
    }

    // 獲取資產
    get(key) {
        return this.assets.get(key);
    }

    // 檢查資產是否存在
    has(key) {
        return this.assets.has(key);
    }

    // 獲取所有資產的鍵名
    getKeys() {
        return Array.from(this.assets.keys());
    }

    // 清除所有資產
    clear() {
        this.assets.clear();
        this.loadQueue = [];
        this.loadedCount = 0;
        this.totalCount = 0;
        this.isLoading = false;
    }

    // 獲取載入進度
    getProgress() {
        return this.totalCount > 0 ? this.loadedCount / this.totalCount : 0;
    }

    // 事件監聽
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    // 移除事件監聽
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // 觸發事件
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                callback(data);
            });
        }
    }
}

/**
 * 預設資產配置
 */
const DEFAULT_ASSETS = {
    images: {
        'kani_idle': 'assets/images/kani_idle.png',
        'kani_cast': 'assets/images/kani_cast.png',
        'kani_dash': 'assets/images/kani_dash.png',
        'spell_fire': 'assets/images/spells/fire.png',
        'spell_ice': 'assets/images/spells/ice.png',
        'spell_lightning': 'assets/images/spells/lightning.png',
        'spell_arcane': 'assets/images/spells/arcane.png',
        'enemy_slime': 'assets/images/enemies/slime.png',
        'enemy_goblin': 'assets/images/enemies/goblin.png',
        'enemy_orc': 'assets/images/enemies/orc.png',
        'enemy_boss': 'assets/images/enemies/boss.png',
        'loot_gold': 'assets/images/loot/gold.png',
        'loot_gem': 'assets/images/loot/gem.png',
        'ui_health_bar': 'assets/images/ui/health_bar.png',
        'ui_mana_bar': 'assets/images/ui/mana_bar.png',
        'background': 'assets/images/background.png',
        'particles': 'assets/images/particles.png'
    },
    audio: {
        'music_menu': 'assets/audio/music/menu.mp3',
        'music_game': 'assets/audio/music/game.mp3',
        'music_boss': 'assets/audio/music/boss.mp3',
        'sfx_spell_fire': 'assets/audio/sfx/spell_fire.mp3',
        'sfx_spell_ice': 'assets/audio/sfx/spell_ice.mp3',
        'sfx_spell_lightning': 'assets/audio/sfx/spell_lightning.mp3',
        'sfx_spell_arcane': 'assets/audio/sfx/spell_arcane.mp3',
        'sfx_enemy_hit': 'assets/audio/sfx/enemy_hit.mp3',
        'sfx_enemy_death': 'assets/audio/sfx/enemy_death.mp3',
        'sfx_player_hit': 'assets/audio/sfx/player_hit.mp3',
        'sfx_levelup': 'assets/audio/sfx/levelup.mp3',
        'sfx_coin': 'assets/audio/sfx/coin.mp3',
        'sfx_achievement': 'assets/audio/sfx/achievement.mp3',
        'sfx_button_click': 'assets/audio/sfx/button_click.mp3',
        'sfx_button_hover': 'assets/audio/sfx/button_hover.mp3'
    },
    json: {
        'equipment_data': 'assets/data/equipment.json',
        'enemy_data': 'assets/data/enemies.json',
        'spell_data': 'assets/data/spells.json',
        'achievement_data': 'assets/data/achievements.json'
    }
};

// 全域資產載入器實例
const assetLoader = new AssetLoader();

// 載入預設資產
function loadDefaultAssets() {
    // 載入圖像
    for (const [key, src] of Object.entries(DEFAULT_ASSETS.images)) {
        assetLoader.addImage(key, src);
    }

    // 載入音效
    for (const [key, src] of Object.entries(DEFAULT_ASSETS.audio)) {
        assetLoader.addAudio(key, src);
    }

    // 載入 JSON 資料
    for (const [key, src] of Object.entries(DEFAULT_ASSETS.json)) {
        assetLoader.addJSON(key, src);
    }

    return assetLoader.load();
}