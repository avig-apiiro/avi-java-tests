// TODO rename? change type?
export class EntityStack<TData> {
    private _topNode: Node<TData> | undefined = undefined;
    private _count: number = 0;

    public count(): number {
        return this._count;
    }

    public isEmpty(): boolean {
        return this._topNode === undefined;
    }

    public push(value: TData): void {
        this._topNode = new Node<TData>(value, this._topNode);
        this._count++;
    }

    public pop(): TData {
        if (this._topNode == undefined) {
            throw new Error("Attempt to pop from an empty stack.");
        }
        const poppedNode = this._topNode;
        this._topNode = poppedNode.previous;
        this._count--;
        return poppedNode.data;
    }

    public peek(): TData {
        if (this._topNode == undefined) {
            throw new Error("Attempt to peek at an empty stack.");
        }
        return this._topNode.data;
    }
}

class Node<T> {
    previous: Node<T> | undefined;
    data: T;

    constructor(data: T, previous: Node<T> | undefined) {
        this.previous = previous;
        this.data = data;
    }
}
