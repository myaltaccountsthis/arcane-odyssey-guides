// Custom set (hashmap implementation)

class Entry<T> {
  key: T;
  next: Entry<T> | null;

  constructor(key: T) {
    this.key = key;
    this.next = null;
  }
}

class CustomSet<T> {
  hashFunction: (key: T) => number;
  equalsFunction: (a: T, b: T) => boolean;
  entries: (Entry<T> | null)[];
  size: number;

  constructor(
    hashFunction: (key: T) => number,
    equalsFunction: (a: T, b: T) => boolean
  ) {
    this.hashFunction = hashFunction;
    this.equalsFunction = equalsFunction;
    // we are dealing with hundreds of thousands of builds
    this.entries = new Array(1000);
    this.size = 0;
    this.clear();
  }

  hash(key: T) {
    return this.hashFunction(key) % this.entries.length;
  }

  add(key: T) {
    const hash = this.hashFunction(key);
    let entry = this.entries[hash];
    if (entry == null) {
      this.entries[hash] = new Entry(key);
    } else {
      while (entry.next != null && !this.equalsFunction(entry.key, key)) {
        entry = entry.next;
      }
      if (this.equalsFunction(entry.key, key)) {
        return false;
      }
      entry.next = new Entry(key);
    }
    this.size++;
    return true;
  }

  addAll(arr: T[]) {
    for (const key of arr) {
      this.add(key);
    }
  }

  contains(key: T) {
    const hash = this.hashFunction(key);
    let entry = this.entries[hash];
    while (entry != null) {
      if (this.equalsFunction(entry.key, key)) {
        return true;
      }
      entry = entry.next;
    }
    return false;
  }

  remove(key: T) {
    const hash = this.hashFunction(key);
    let entry = this.entries[hash];
    if (entry == null) {
      return false;
    }
    if (this.equalsFunction(entry.key, key)) {
      this.entries[hash] = entry.next;
    } else {
      while (entry.next != null && !this.equalsFunction(entry.next.key, key)) {
        entry = entry.next;
      }
      if (entry.next == null) {
        return false;
      }
      entry.next = entry.next.next;
    }
    this.size--;
    return true;
  }

  clear() {
    this.entries = new Array(1000);
    this.size = 0;
  }

  toList() {
    const list = [];
    for (const i in this.entries) {
      let entry = this.entries[i];
      while (entry != null) {
        list.push(entry.key);
        entry = entry.next;
      }
    }
    return list;
  }
}

export default CustomSet;
