/**
 * 物件池系統
 * 用於重複使用物件，減少記憶體分配和垃圾回收
 */
class ObjectPool {
    constructor(createFunction, resetFunction = null, initialSize = 10) {
        this.createFunction = createFunction;
        this.resetFunction = resetFunction;
        this.pool = [];
        this.activeObjects = [];
        
        // 預先建立初始物件
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFunction());
        }
    }

    // 從池中獲取物件
    acquire() {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFunction();
        }
        
        this.activeObjects.push(obj);
        return obj;
    }

    // 將物件返回池中
    release(obj) {
        const index = this.activeObjects.indexOf(obj);
        if (index > -1) {
            this.activeObjects.splice(index, 1);
            
            // 重置物件狀態
            if (this.resetFunction) {
                this.resetFunction(obj);
            }
            
            this.pool.push(obj);
        }
    }

    // 釋放所有活動物件
    releaseAll() {
        while (this.activeObjects.length > 0) {
            this.release(this.activeObjects[0]);
        }
    }

    // 獲取活動物件數量
    getActiveCount() {
        return this.activeObjects.length;
    }

    // 獲取池中可用物件數量
    getAvailableCount() {
        return this.pool.length;
    }

    // 獲取總物件數量
    getTotalCount() {
        return this.pool.length + this.activeObjects.length;
    }

    // 清空池
    clear() {
        this.releaseAll();
        this.pool = [];
    }

    // 預分配更多物件
    preAllocate(count) {
        for (let i = 0; i < count; i++) {
            this.pool.push(this.createFunction());
        }
    }
}

/**
 * 物件池管理器
 * 統一管理多個物件池
 */
class ObjectPoolManager {
    constructor() {
        this.pools = new Map();
    }

    // 註冊物件池
    registerPool(name, createFunction, resetFunction = null, initialSize = 10) {
        this.pools.set(name, new ObjectPool(createFunction, resetFunction, initialSize));
    }

    // 獲取物件池
    getPool(name) {
        return this.pools.get(name);
    }

    // 從指定池中獲取物件
    acquire(poolName) {
        const pool = this.pools.get(poolName);
        if (pool) {
            return pool.acquire();
        }
        console.warn(`Object pool '${poolName}' not found`);
        return null;
    }

    // 將物件返回指定池
    release(poolName, obj) {
        const pool = this.pools.get(poolName);
        if (pool) {
            pool.release(obj);
        } else {
            console.warn(`Object pool '${poolName}' not found`);
        }
    }

    // 釋放所有池中的所有物件
    releaseAll() {
        for (const pool of this.pools.values()) {
            pool.releaseAll();
        }
    }

    // 清空所有池
    clear() {
        for (const pool of this.pools.values()) {
            pool.clear();
        }
        this.pools.clear();
    }

    // 獲取所有池的統計資訊
    getStats() {
        const stats = {};
        for (const [name, pool] of this.pools) {
            stats[name] = {
                active: pool.getActiveCount(),
                available: pool.getAvailableCount(),
                total: pool.getTotalCount()
            };
        }
        return stats;
    }
}

// 全域物件池管理器實例
const poolManager = new ObjectPoolManager();