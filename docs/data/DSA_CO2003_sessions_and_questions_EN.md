# CO2003 – Data Structures and Algorithms: 15-Session Outline & Question Bank

Sample data for the pilot course. The schedule (Tuesday, periods 2-4, 07:00–09:50, room H6-302) is a sample value; the actual date of each session is computed from the semester start date when loading into `course_sessions`.

## 1. 15-Session Outline

| Session | Title | Skill code | Objective | Room | Sample schedule |
|---|---|---|---|---|---|
| 1 | Course Introduction & C++ Review | DSA-ARRAY | Understand the course goals, review basic C++ and the concept of pointers | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 2 | Arrays & Pointers, Dynamic Allocation | DSA-ARRAY | Work with arrays and pointers; allocate and free dynamic memory | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 3 | Algorithm Complexity Analysis | DSA-COMPLEXITY | Understand and compute the Big-O complexity of simple code | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 4 | Singly Linked Lists | DSA-LINKEDLIST | Implement insertion, deletion and search on a singly linked list | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 5 | Doubly & Circular Linked Lists | DSA-LINKEDLIST | Distinguish and implement doubly and circular linked lists | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 6 | Stack | DSA-STACK | Understand LIFO, implement a stack and its applications (balanced parentheses, postfix expressions) | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 7 | Queue | DSA-QUEUE | Understand FIFO, implement a queue and a circular queue, and their applications | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 8 | Recursion | DSA-RECURSION | Identify the base case and recursive step, and analyze the cost of recursion | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 9 | Sorting | DSA-SORT | Compare sorting algorithms (selection, insertion, merge, quick) by complexity | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 10 | Trees & Binary Trees | DSA-TREE | Learn tree terminology and the preorder, inorder and postorder traversals | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 11 | Binary Search Trees (BST) | DSA-TREE | Implement insertion, deletion and search on a BST and understand the degenerate case | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 12 | AVL Trees | DSA-TREE | Understand the AVL balance condition and perform rotations | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 13 | Heaps & Priority Queues | DSA-HEAP | Implement a heap with an array, insertion, removing the root, and heap sort | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 14 | Graphs | DSA-GRAPH | Represent graphs (adjacency matrix, adjacency list) and traverse them with BFS and DFS | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |
| 15 | Hash Tables & Review | DSA-HASH | Understand hash functions, collisions and how to resolve them; review the whole course | H6-302 | Tuesday, Periods 2-4 (07:00–09:50) |

## 2. Knowledge Components

| Skill code | Content | Questions |
|---|---|---|
| DSA-ARRAY | Arrays & Pointers | 5 |
| DSA-COMPLEXITY | Algorithm complexity | 1 |
| DSA-LINKEDLIST | Linked lists | 6 |
| DSA-STACK | Stack | 4 |
| DSA-QUEUE | Queue | 3 |
| DSA-RECURSION | Recursion | 1 |
| DSA-SORT | Sorting | 2 |
| DSA-TREE | Binary trees, BST, AVL | 8 |
| DSA-HEAP | Heap | 2 |
| DSA-GRAPH | Graphs | 5 |
| DSA-HASH | Hash tables | 3 |

Total: **40 questions** (correct answers are shuffled across positions).

## 3. Multiple-Choice Question Bank

**DSA-Q01** · Session 1 · `DSA-ARRAY` · easy

After the code: int x = 10; int *p = &x; *p = 20; what is the value of x?

- A. 10
- B. Compilation error
- C. The address of x
- D. 20

**Answer:** D. p points to x, so assigning *p = 20 directly changes the value of x.

**DSA-Q02** · Session 2 · `DSA-ARRAY` · easy

What is the time complexity of accessing the element arr[i] of an array?

- A. O(1)
- B. O(n²)
- C. O(n)
- D. O(log n)

**Answer:** A. Arrays are stored contiguously, so an element's address is computed directly from its index.

**DSA-Q03** · Session 2 · `DSA-ARRAY` · medium

What is the worst-case complexity of inserting an element at the beginning of a sequential array of n elements (shifting the others)?

- A. O(1)
- B. O(n log n)
- C. O(log n)
- D. O(n)

**Answer:** D. All n elements must be shifted one position to the right.

**DSA-Q04** · Session 2 · `DSA-ARRAY` · easy

Given int a[5]; int *p = a; the expression *(p + 2) is equivalent to?

- A. &a[2]
- B. a[2]
- C. a[3]
- D. a + 2

**Answer:** B. Pointer arithmetic p + 2 points to element 2 (zero-based); dereferencing it gives a[2].

**DSA-Q05** · Session 2 · `DSA-ARRAY` · medium

An array allocated with int *a = new int[n]; must be freed how?

- A. a = NULL;
- B. delete[] a;
- C. delete a;
- D. free(a);

**Answer:** B. An array allocated with new[] must be freed with delete[]; a plain delete causes undefined behavior.

**DSA-Q06** · Session 3 · `DSA-COMPLEXITY` · easy

A piece of code has two nested for loops, each running from 1 to n, with a simple assignment as the body. What is its complexity?

- A. O(n²)
- B. O(n)
- C. O(2n)
- D. O(log n)

**Answer:** A. The inner body runs n × n times.

**DSA-Q07** · Session 4 · `DSA-LINKEDLIST` · easy

What is the complexity of inserting a node at the head of a singly linked list (with a head pointer)?

- A. O(n)
- B. O(n²)
- C. O(1)
- D. O(log n)

**Answer:** C. Create the new node, set next = head, then update head.

**DSA-Q08** · Session 4 · `DSA-LINKEDLIST` · easy

What is the worst-case complexity of searching for a value in a singly linked list of n nodes?

- A. O(n)
- B. O(1)
- C. O(n log n)
- D. O(log n)

**Answer:** A. The list is traversed sequentially from the head and may visit all n nodes.

**DSA-Q09** · Session 4 · `DSA-LINKEDLIST` · medium

To delete the node right after node p (where p->next is not NULL), the correct approach is?

- A. Save q = p->next; set p->next = q->next; free q
- B. Set p->next = NULL
- C. Set p = p->next, then free p
- D. Free p->next first, then set p->next = p->next->next

**Answer:** A. The node to delete must be saved, p linked to the node after it, and only then freed; freeing first loses the reference.

**DSA-Q10** · Session 4 · `DSA-LINKEDLIST` · easy

Compared with arrays, the main drawback of linked lists is?

- A. Elements cannot be deleted
- B. New elements cannot be added
- C. The size must be fixed
- D. Accessing the i-th element takes O(n)

**Answer:** D. Linked lists have no random access; they must be traversed from the head.

**DSA-Q11** · Session 5 · `DSA-LINKEDLIST` · medium

The advantage of a doubly linked list over a singly linked list is?

- A. It uses less memory
- B. It can be traversed in both directions, and a node can be deleted in O(1) when a pointer to it is known
- C. The i-th element is accessed in O(1)
- D. No head pointer is needed

**Answer:** B. Each node has an extra prev pointer, so there is no need to traverse again to find the previous node.

**DSA-Q12** · Session 5 · `DSA-LINKEDLIST` · easy

In a singly circular linked list, where does the next pointer of the last node point?

- A. The node just before it
- B. Itself
- C. NULL
- D. The first node

**Answer:** D. The circular property: the last node links back to the first.

**DSA-Q13** · Session 6 · `DSA-STACK` · easy

Which principle does a stack follow?

- A. FIFO (first in, first out)
- B. Random
- C. LIFO (last in, first out)
- D. By priority

**Answer:** C. The element pushed last is popped first.

**DSA-Q14** · Session 6 · `DSA-STACK` · medium

Which data structure is best suited to check whether a string of brackets ()[]{} is balanced?

- A. Two-dimensional array
- B. Hash table
- C. Stack
- D. Queue

**Answer:** C. A closing bracket must match the most recent unclosed opening bracket, which is exactly the LIFO property.

**DSA-Q15** · Session 6 · `DSA-STACK` · medium

What is the value of the postfix expression 3 4 + 2 * ?

- A. 24
- B. 14
- C. 9
- D. 10

**Answer:** B. 3 4 + gives 7, then 7 2 * gives 14.

**DSA-Q16** · Session 6 · `DSA-STACK` · easy

Performing pop on an empty stack causes which situation?

- A. Memory leak
- B. Stack underflow
- C. Collision
- D. Stack overflow

**Answer:** B. Underflow occurs when taking an element from an empty structure.

**DSA-Q17** · Session 7 · `DSA-QUEUE` · easy

Which principle does a queue follow?

- A. By largest value
- B. FIFO (first in, first out)
- C. LIFO (last in, first out)
- D. Random

**Answer:** B. The element enqueued first is dequeued first.

**DSA-Q18** · Session 7 · `DSA-QUEUE` · easy

Enqueue 1, 2, 3 into an empty queue, then dequeue once. Which element is at the front now?

- A. The queue is empty
- B. 1
- C. 3
- D. 2

**Answer:** D. Dequeue removes 1, so the next front element is 2.

**DSA-Q19** · Session 7 · `DSA-QUEUE` · medium

What is the main purpose of a circular queue implemented with an array?

- A. To grow the array automatically
- B. To reuse the empty slots at the start of the array without shifting elements
- C. To allow random access
- D. To sort elements automatically

**Answer:** B. The front/rear indices wrap around, so the free space at the front is not wasted.

**DSA-Q20** · Session 8 · `DSA-RECURSION` · medium

A recursive factorial function missing its base case (n = 0 or n = 1) will lead to?

- A. It runs faster
- B. The result is always 1
- C. The result is always 0
- D. Infinite recursion and a call stack overflow

**Answer:** D. With no stopping point, calls keep stacking up until the stack memory overflows.

**DSA-Q21** · Session 9 · `DSA-SORT` · medium

What is the worst-case complexity of Quick Sort?

- A. O(n)
- B. O(n log n)
- C. O(n²)
- D. O(log n)

**Answer:** C. When the pivot is always the smallest or largest element, the partition is highly unbalanced.

**DSA-Q22** · Session 9 · `DSA-SORT` · medium

What is the time complexity of Merge Sort in all cases?

- A. O(n)
- B. O(n²)
- C. O(log n)
- D. O(n log n)

**Answer:** D. The array is halved log n times and merging each level costs O(n).

**DSA-Q23** · Session 10 · `DSA-TREE` · easy

In what order does a preorder traversal of a binary tree visit the nodes?

- A. Right, root, left
- B. Left, root, right
- C. Left, right, root
- D. Root, left, right

**Answer:** D. Preorder visits the root first, then the left subtree, then the right subtree.

**DSA-Q24** · Session 10 · `DSA-TREE` · medium

With the root at level 0, what is the maximum number of nodes at level i of a binary tree?

- A. 2^(i+1)
- B. 2i
- C. 2^i
- D. i²

**Answer:** C. Each level has at most twice as many nodes as the level above it.

**DSA-Q25** · Session 10 · `DSA-TREE` · easy

What sequence of keys does an inorder traversal of a binary search tree produce?

- A. Ascending
- B. Level by level
- C. Random
- D. Descending

**Answer:** A. Left < root < right, so inorder traversal gives a sorted ascending sequence.

**DSA-Q26** · Session 11 · `DSA-TREE` · medium

Insert 50, 30, 70, 20, 40 in that order into an empty BST. What is the preorder traversal?

- A. 50 30 70 20 40
- B. 20 40 30 70 50
- C. 20 30 40 50 70
- D. 50 30 20 40 70

**Answer:** D. Root 50, left child 30 (with children 20 and 40), right child 70; preorder: 50, 30, 20, 40, 70.

**DSA-Q27** · Session 11 · `DSA-TREE` · medium

If keys already sorted in ascending order are inserted into an empty BST, what is the search complexity afterwards?

- A. O(n log n)
- B. O(n)
- C. O(log n)
- D. O(1)

**Answer:** B. The tree degenerates into a linked list, so its height is n.

**DSA-Q28** · Session 12 · `DSA-TREE` · easy

What is the balance condition of an AVL tree?

- A. The left subtree is always taller than the right
- B. All leaf nodes are at the same level
- C. For every node, the heights of its two subtrees differ by at most 1
- D. Both subtrees have the same number of nodes

**Answer:** C. The balance factor of every node must be in {-1, 0, 1}.

**DSA-Q29** · Session 12 · `DSA-TREE` · hard

Insert 10, 20, 30 in that order into an empty AVL tree. Which rotation is needed and what is the new root?

- A. Right rotation at node 30; the root is 10
- B. No rotation; the root stays 10
- C. Left-right rotation; the root is 30
- D. Left rotation at node 10; the root is 20

**Answer:** D. Inserting 30 creates a right-right imbalance at 10, so a left rotation brings 20 up as the root.

**DSA-Q30** · Session 12 · `DSA-TREE` · medium

What is the height of an AVL tree with n nodes?

- A. O(log n)
- B. O(√n)
- C. O(n)
- D. O(1)

**Answer:** A. An AVL tree is always nearly balanced, so its height is proportional to log n.

**DSA-Q31** · Session 13 · `DSA-HEAP` · easy

In a max-heap, what is the relationship between a parent node and its children?

- A. Nodes at the same level are equal
- B. The parent is smaller than its children
- C. The parent's value is greater than or equal to its children's values
- D. The left child is always larger than the right

**Answer:** C. As a result, the largest element is at the root.

**DSA-Q32** · Session 13 · `DSA-HEAP` · medium

A heap is stored in an array indexed from 0. At which position is the left child of the node with index i?

- A. 2i + 2
- B. 2i + 1
- C. i / 2
- D. 2i

**Answer:** B. With zero-based indexing, the left child is at 2i + 1 and the right child at 2i + 2.

**DSA-Q33** · Session 14 · `DSA-GRAPH` · easy

Which data structure does breadth-first search (BFS) use?

- A. Heap
- B. Hash table
- C. Stack
- D. Queue

**Answer:** D. BFS visits vertices layer by layer by distance, which matches the FIFO property.

**DSA-Q34** · Session 14 · `DSA-GRAPH` · easy

Which structure or technique is commonly used for depth-first search (DFS)?

- A. Stack or recursion
- B. Queue
- C. Heap
- D. AVL tree

**Answer:** A. DFS goes as deep as possible down one branch and then backtracks, which corresponds to a stack or recursion.

**DSA-Q35** · Session 14 · `DSA-GRAPH` · medium

How much memory does an adjacency matrix of a graph with n vertices take?

- A. O(1)
- B. O(n)
- C. O(n²)
- D. O(n log n)

**Answer:** C. An adjacency matrix has n × n entries.

**DSA-Q36** · Session 14 · `DSA-GRAPH` · medium

A complete undirected graph (every pair of vertices is connected) has 5 vertices. How many edges does it have?

- A. 5
- B. 10
- C. 15
- D. 20

**Answer:** B. The number of edges is C(5,2) = 5 × 4 / 2 = 10.

**DSA-Q37** · Session 14 · `DSA-GRAPH` · medium

When is an adjacency list usually better than an adjacency matrix?

- A. When the graph is sparse (few edges)
- B. When the number of vertices is very small
- C. When the graph is complete
- D. When edge lookup must be O(1) for every pair

**Answer:** A. An adjacency list stores only the edges that actually exist, taking O(V + E).

**DSA-Q38** · Session 15 · `DSA-HASH` · easy

What is a collision in a hash table?

- A. The hash function returns a negative value
- B. Two different keys are hashed to the same position
- C. One key is hashed to two positions
- D. The hash table is completely full

**Answer:** B. Because the key space is larger than the number of slots, collisions cannot be avoided entirely.

**DSA-Q39** · Session 15 · `DSA-HASH` · medium

How does collision handling by chaining work?

- A. Find the next empty slot in the table
- B. Each slot of the table holds a linked list of elements with the same hash index
- C. Immediately double the table size
- D. Delete the old element

**Answer:** B. Colliding keys are appended to the same list at that slot.

**DSA-Q40** · Session 15 · `DSA-HASH` · easy

With a good hash function and a reasonable load factor, what is the average search complexity in a hash table?

- A. O(n log n)
- B. O(1)
- C. O(log n)
- D. O(n)

**Answer:** B. The key maps directly to the slot to look up, with few collisions.
