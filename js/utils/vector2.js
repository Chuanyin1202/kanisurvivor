/**
 * 2D 向量類別
 * 用於處理位置、速度、方向等二維向量運算
 */
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // 複製向量
    copy() {
        return new Vector2(this.x, this.y);
    }

    // 設定向量值
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    // 從另一個向量複製值
    copyFrom(vector) {
        this.x = vector.x;
        this.y = vector.y;
        return this;
    }

    // 向量相加
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    // 向量相減
    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    // 向量乘以標量
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    // 向量除以標量
    divide(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }

    // 計算向量長度
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // 計算向量長度的平方（避免開方運算，提高效能）
    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    // 正規化向量（變成單位向量）
    normalize() {
        const length = this.length();
        if (length > 0) {
            this.divide(length);
        }
        return this;
    }

    // 計算兩向量的距離
    distanceTo(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 計算兩向量的距離平方
    distanceSquaredTo(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return dx * dx + dy * dy;
    }

    // 計算向量角度（弧度）
    angle() {
        return Math.atan2(this.y, this.x);
    }

    // 計算兩向量之間的角度
    angleTo(vector) {
        return Math.atan2(vector.y - this.y, vector.x - this.x);
    }

    // 點積
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    // 叉積（2D 向量返回標量）
    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }

    // 向量反向
    negate() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    // 向量線性插值
    lerp(vector, t) {
        this.x += (vector.x - this.x) * t;
        this.y += (vector.y - this.y) * t;
        return this;
    }

    // 限制向量長度
    limit(maxLength) {
        const length = this.length();
        if (length > maxLength) {
            this.normalize().multiply(maxLength);
        }
        return this;
    }

    // 轉換為字串
    toString() {
        return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    // 靜態方法：創建零向量
    static zero() {
        return new Vector2(0, 0);
    }

    // 靜態方法：創建單位向量
    static one() {
        return new Vector2(1, 1);
    }

    // 靜態方法：創建向上向量
    static up() {
        return new Vector2(0, -1);
    }

    // 靜態方法：創建向下向量
    static down() {
        return new Vector2(0, 1);
    }

    // 靜態方法：創建向左向量
    static left() {
        return new Vector2(-1, 0);
    }

    // 靜態方法：創建向右向量
    static right() {
        return new Vector2(1, 0);
    }

    // 靜態方法：從角度創建向量
    static fromAngle(angle, length = 1) {
        return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
    }

    // 靜態方法：向量相加
    static add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    // 靜態方法：向量相減
    static subtract(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

    // 靜態方法：向量乘以標量
    static multiply(vector, scalar) {
        return new Vector2(vector.x * scalar, vector.y * scalar);
    }

    // 靜態方法：向量線性插值
    static lerp(v1, v2, t) {
        return new Vector2(
            v1.x + (v2.x - v1.x) * t,
            v1.y + (v2.y - v1.y) * t
        );
    }

    // 靜態方法：隨機方向向量
    static random(length = 1) {
        const angle = Math.random() * Math.PI * 2;
        return Vector2.fromAngle(angle, length);
    }
}