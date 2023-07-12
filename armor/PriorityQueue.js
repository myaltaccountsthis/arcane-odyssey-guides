// Priority Queue (array heap implementation)

class PriorityQueue {
  // compareFunction is default greatest to least, arr is optional buildHeap
  // index 0 is first element
  constructor(compareFunction = (a, b) => b.compare(a), arr) {
    this.compareFunction = compareFunction;
    if (arr) {
      this.heap = arr.slice();
      this.size = arr.length;
      for (let i = Math.floor(this.size / 2) - 1; i >= 0; i--) {
        this.siftDown(i);
      }
    }
    else {
      this.heap = [];
      this.size = 0;
    }
  }

  left(i) {
    return 2 * i + 1;
  }

  right(i) {
    return 2 * i + 2;
  }

  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  siftDown(i) {
    if (this.left(i) >= this.size)
      return;
    let min = i;
    const left = this.left(i);
    const right = this.right(i);
    if (this.compareFunction(this.heap[left], this.heap[min]) < 0) {
      min = left;
    }
    if (right < this.size && this.compareFunction(this.heap[right], this.heap[min]) < 0) {
      min = right;
    }
    if (min != i) {
      const temp = this.heap[i];
      this.heap[i] = this.heap[min];
      this.heap[min] = temp;
      this.siftDown(min);
    }
  }

  siftUp(i) {
    if (i <= 0)
      return;
    const parent = this.parent(i);
    if (this.compareFunction(this.heap[i], this.heap[parent]) < 0) {
      const temp = this.heap[i];
      this.heap[i] = this.heap[parent];
      this.heap[parent] = temp;
      this.siftUp(parent);
    }
  }

  offer(e) {
    this.size++;
    this.heap.push(e);
    this.siftUp(this.size - 1);
  }

  poll() {
    if (this.size == 0)
      return null;
    const e = this.heap[0];
    this.heap[0] = this.heap[this.size - 1];
    this.heap.pop();
    this.size--;
    this.siftDown(0);
    return e;
  }

  peek() {
    if (this.size == 0)
      return null;
    return this.heap[0];
  }

  isEmpty() {
    return this.size == 0;
  }

  toList() {
    const list = [];
    while (!this.isEmpty()) {
      list.push(this.poll());
    }
    for (const e of list) {
      this.offer(e);
    }
    return list;
  }
}