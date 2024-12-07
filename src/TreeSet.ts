type Comparator<T> = (a: T, b: T) => number;

class TreeNode<T> {
    value: T;
    left: TreeNode<T> | null = null;
    right: TreeNode<T> | null = null;
    color: 'red' | 'black' = 'red';

    constructor(value: T) {
        this.value = value;
    }
}

class TreeSet<T> {
    private root: TreeNode<T> | null = null;
    private comparator: Comparator<T>;
    private _size: number = 0;

    constructor(comparator: Comparator<T>) {
        this.comparator = comparator;
    }

    get size(): number {
        return this._size;
    }

    add(value: T): boolean {
        if (!this.contains(value)) {
            this.root = this.insert(this.root, value);
            if (this.root) this.root.color = 'black';
            this._size++;
            return true;
        }
        return false;
    }

    contains(value: T): boolean {
        return this.find(this.root, value) !== null;
    }

    delete(value: T): boolean {
        if (this.contains(value)) {
            this.root = this.remove(this.root, value);
            if (this.root) this.root.color = 'black';
            this._size--;
            return true;
        }
        return false;
    }

    private insert(node: TreeNode<T> | null, value: T): TreeNode<T> {
        if (!node) return new TreeNode(value);

        if (this.comparator(value, node.value) < 0) {
            node.left = this.insert(node.left, value);
        } else if (this.comparator(value, node.value) > 0) {
            node.right = this.insert(node.right, value);
        }

        return this.balance(node);
    }

    private remove(node: TreeNode<T> | null, value: T): TreeNode<T> | null {
        if (!node) return null;

        if (this.comparator(value, node.value) < 0) {
            node.left = this.remove(node.left, value);
        } else if (this.comparator(value, node.value) > 0) {
            node.right = this.remove(node.right, value);
        } else {
            if (!node.left) return node.right;
            if (!node.right) return node.left;

            const successor = this.min(node.right);
            node.value = successor.value;
            node.right = this.remove(node.right, successor.value);
        }

        return this.balance(node);
    }

    private find(node: TreeNode<T> | null, value: T): TreeNode<T> | null {
        if (!node) return null;

        const comp = this.comparator(value, node.value);
        if (comp < 0) return this.find(node.left, value);
        if (comp > 0) return this.find(node.right, value);
        return node;
    }

    private min(node: TreeNode<T>): TreeNode<T> {
        while (node.left) {
            node = node.left;
        }
        return node;
    }

    public first(): T | null {
        if (!this.root) return null;
        return this.min(this.root).value;
    }

    private max(node: TreeNode<T>): TreeNode<T> {
        while (node.right) {
            node = node.right;
        }
        return node;
    }

    public last(): T | null {
        if (!this.root) return null;
        return this.max(this.root).value;
    }

    public clear(): void {
        this.root = null;
        this._size = 0;
    }

    private balance(node: TreeNode<T>): TreeNode<T> {
        if (this.isRed(node.right) && !this.isRed(node.left)) node = this.rotateLeft(node);
        if (this.isRed(node.left) && node.left && this.isRed(node.left.left)) node = this.rotateRight(node);
        if (this.isRed(node.left) && this.isRed(node.right)) this.flipColors(node);

        return node;
    }

    private isRed(node: TreeNode<T> | null): boolean {
        return node !== null && node.color === 'red';
    }

    private rotateLeft(node: TreeNode<T>): TreeNode<T> {
        const x = node.right!;
        node.right = x.left;
        x.left = node;
        x.color = node.color;
        node.color = 'red';
        return x;
    }

    private rotateRight(node: TreeNode<T>): TreeNode<T> {
        const x = node.left!;
        node.left = x.right;
        x.right = node;
        x.color = node.color;
        node.color = 'red';
        return x;
    }

    private flipColors(node: TreeNode<T>): void {
        node.color = 'red';
        node.left!.color = 'black';
        node.right!.color = 'black';
    }

    public toList(): T[] {
        const result: T[] = [];
        this.reverseOrder(this.root, result);
        return result;
    }

    private reverseOrder(node: TreeNode<T> | null, result: T[]): void {
        if (!node) return;
        this.reverseOrder(node.right, result);
        result.push(node.value);
        this.reverseOrder(node.left, result);
    }
}

export default TreeSet;