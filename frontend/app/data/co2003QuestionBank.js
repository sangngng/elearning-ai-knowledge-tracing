// Ngân hàng 40 câu trắc nghiệm CO2003, nguồn: docs/data/dsa_co2003_questions_en.json
export const CO2003_QUESTION_BANK = [
  {
    "id": "DSA-Q01",
    "sessionNumber": 1,
    "skillCode": "DSA-ARRAY",
    "difficulty": "easy",
    "prompt": "After the code: int x = 10; int *p = &x; *p = 20; what is the value of x?",
    "options": [
      {
        "id": "A",
        "text": "10"
      },
      {
        "id": "B",
        "text": "Compilation error"
      },
      {
        "id": "C",
        "text": "The address of x"
      },
      {
        "id": "D",
        "text": "20"
      }
    ],
    "correctAnswer": "D",
    "explanation": "p points to x, so assigning *p = 20 directly changes the value of x."
  },
  {
    "id": "DSA-Q02",
    "sessionNumber": 2,
    "skillCode": "DSA-ARRAY",
    "difficulty": "easy",
    "prompt": "What is the time complexity of accessing the element arr[i] of an array?",
    "options": [
      {
        "id": "A",
        "text": "O(1)"
      },
      {
        "id": "B",
        "text": "O(n²)"
      },
      {
        "id": "C",
        "text": "O(n)"
      },
      {
        "id": "D",
        "text": "O(log n)"
      }
    ],
    "correctAnswer": "A",
    "explanation": "Arrays are stored contiguously, so an element's address is computed directly from its index."
  },
  {
    "id": "DSA-Q03",
    "sessionNumber": 2,
    "skillCode": "DSA-ARRAY",
    "difficulty": "medium",
    "prompt": "What is the worst-case complexity of inserting an element at the beginning of a sequential array of n elements (shifting the others)?",
    "options": [
      {
        "id": "A",
        "text": "O(1)"
      },
      {
        "id": "B",
        "text": "O(n log n)"
      },
      {
        "id": "C",
        "text": "O(log n)"
      },
      {
        "id": "D",
        "text": "O(n)"
      }
    ],
    "correctAnswer": "D",
    "explanation": "All n elements must be shifted one position to the right."
  },
  {
    "id": "DSA-Q04",
    "sessionNumber": 2,
    "skillCode": "DSA-ARRAY",
    "difficulty": "easy",
    "prompt": "Given int a[5]; int *p = a; the expression *(p + 2) is equivalent to?",
    "options": [
      {
        "id": "A",
        "text": "&a[2]"
      },
      {
        "id": "B",
        "text": "a[2]"
      },
      {
        "id": "C",
        "text": "a[3]"
      },
      {
        "id": "D",
        "text": "a + 2"
      }
    ],
    "correctAnswer": "B",
    "explanation": "Pointer arithmetic p + 2 points to element 2 (zero-based); dereferencing it gives a[2]."
  },
  {
    "id": "DSA-Q05",
    "sessionNumber": 2,
    "skillCode": "DSA-ARRAY",
    "difficulty": "medium",
    "prompt": "An array allocated with int *a = new int[n]; must be freed how?",
    "options": [
      {
        "id": "A",
        "text": "a = NULL;"
      },
      {
        "id": "B",
        "text": "delete[] a;"
      },
      {
        "id": "C",
        "text": "delete a;"
      },
      {
        "id": "D",
        "text": "free(a);"
      }
    ],
    "correctAnswer": "B",
    "explanation": "An array allocated with new[] must be freed with delete[]; a plain delete causes undefined behavior."
  },
  {
    "id": "DSA-Q06",
    "sessionNumber": 3,
    "skillCode": "DSA-COMPLEXITY",
    "difficulty": "easy",
    "prompt": "A piece of code has two nested for loops, each running from 1 to n, with a simple assignment as the body. What is its complexity?",
    "options": [
      {
        "id": "A",
        "text": "O(n²)"
      },
      {
        "id": "B",
        "text": "O(n)"
      },
      {
        "id": "C",
        "text": "O(2n)"
      },
      {
        "id": "D",
        "text": "O(log n)"
      }
    ],
    "correctAnswer": "A",
    "explanation": "The inner body runs n × n times."
  },
  {
    "id": "DSA-Q07",
    "sessionNumber": 4,
    "skillCode": "DSA-LINKEDLIST",
    "difficulty": "easy",
    "prompt": "What is the complexity of inserting a node at the head of a singly linked list (with a head pointer)?",
    "options": [
      {
        "id": "A",
        "text": "O(n)"
      },
      {
        "id": "B",
        "text": "O(n²)"
      },
      {
        "id": "C",
        "text": "O(1)"
      },
      {
        "id": "D",
        "text": "O(log n)"
      }
    ],
    "correctAnswer": "C",
    "explanation": "Create the new node, set next = head, then update head."
  },
  {
    "id": "DSA-Q08",
    "sessionNumber": 4,
    "skillCode": "DSA-LINKEDLIST",
    "difficulty": "easy",
    "prompt": "What is the worst-case complexity of searching for a value in a singly linked list of n nodes?",
    "options": [
      {
        "id": "A",
        "text": "O(n)"
      },
      {
        "id": "B",
        "text": "O(1)"
      },
      {
        "id": "C",
        "text": "O(n log n)"
      },
      {
        "id": "D",
        "text": "O(log n)"
      }
    ],
    "correctAnswer": "A",
    "explanation": "The list is traversed sequentially from the head and may visit all n nodes."
  },
  {
    "id": "DSA-Q09",
    "sessionNumber": 4,
    "skillCode": "DSA-LINKEDLIST",
    "difficulty": "medium",
    "prompt": "To delete the node right after node p (where p->next is not NULL), the correct approach is?",
    "options": [
      {
        "id": "A",
        "text": "Save q = p->next; set p->next = q->next; free q"
      },
      {
        "id": "B",
        "text": "Set p->next = NULL"
      },
      {
        "id": "C",
        "text": "Set p = p->next, then free p"
      },
      {
        "id": "D",
        "text": "Free p->next first, then set p->next = p->next->next"
      }
    ],
    "correctAnswer": "A",
    "explanation": "The node to delete must be saved, p linked to the node after it, and only then freed; freeing first loses the reference."
  },
  {
    "id": "DSA-Q10",
    "sessionNumber": 4,
    "skillCode": "DSA-LINKEDLIST",
    "difficulty": "easy",
    "prompt": "Compared with arrays, the main drawback of linked lists is?",
    "options": [
      {
        "id": "A",
        "text": "Elements cannot be deleted"
      },
      {
        "id": "B",
        "text": "New elements cannot be added"
      },
      {
        "id": "C",
        "text": "The size must be fixed"
      },
      {
        "id": "D",
        "text": "Accessing the i-th element takes O(n)"
      }
    ],
    "correctAnswer": "D",
    "explanation": "Linked lists have no random access; they must be traversed from the head."
  },
  {
    "id": "DSA-Q11",
    "sessionNumber": 5,
    "skillCode": "DSA-LINKEDLIST",
    "difficulty": "medium",
    "prompt": "The advantage of a doubly linked list over a singly linked list is?",
    "options": [
      {
        "id": "A",
        "text": "It uses less memory"
      },
      {
        "id": "B",
        "text": "It can be traversed in both directions, and a node can be deleted in O(1) when a pointer to it is known"
      },
      {
        "id": "C",
        "text": "The i-th element is accessed in O(1)"
      },
      {
        "id": "D",
        "text": "No head pointer is needed"
      }
    ],
    "correctAnswer": "B",
    "explanation": "Each node has an extra prev pointer, so there is no need to traverse again to find the previous node."
  },
  {
    "id": "DSA-Q12",
    "sessionNumber": 5,
    "skillCode": "DSA-LINKEDLIST",
    "difficulty": "easy",
    "prompt": "In a singly circular linked list, where does the next pointer of the last node point?",
    "options": [
      {
        "id": "A",
        "text": "The node just before it"
      },
      {
        "id": "B",
        "text": "Itself"
      },
      {
        "id": "C",
        "text": "NULL"
      },
      {
        "id": "D",
        "text": "The first node"
      }
    ],
    "correctAnswer": "D",
    "explanation": "The circular property: the last node links back to the first."
  },
  {
    "id": "DSA-Q13",
    "sessionNumber": 6,
    "skillCode": "DSA-STACK",
    "difficulty": "easy",
    "prompt": "Which principle does a stack follow?",
    "options": [
      {
        "id": "A",
        "text": "FIFO (first in, first out)"
      },
      {
        "id": "B",
        "text": "Random"
      },
      {
        "id": "C",
        "text": "LIFO (last in, first out)"
      },
      {
        "id": "D",
        "text": "By priority"
      }
    ],
    "correctAnswer": "C",
    "explanation": "The element pushed last is popped first."
  },
  {
    "id": "DSA-Q14",
    "sessionNumber": 6,
    "skillCode": "DSA-STACK",
    "difficulty": "medium",
    "prompt": "Which data structure is best suited to check whether a string of brackets ()[]{} is balanced?",
    "options": [
      {
        "id": "A",
        "text": "Two-dimensional array"
      },
      {
        "id": "B",
        "text": "Hash table"
      },
      {
        "id": "C",
        "text": "Stack"
      },
      {
        "id": "D",
        "text": "Queue"
      }
    ],
    "correctAnswer": "C",
    "explanation": "A closing bracket must match the most recent unclosed opening bracket, which is exactly the LIFO property."
  },
  {
    "id": "DSA-Q15",
    "sessionNumber": 6,
    "skillCode": "DSA-STACK",
    "difficulty": "medium",
    "prompt": "What is the value of the postfix expression 3 4 + 2 * ?",
    "options": [
      {
        "id": "A",
        "text": "24"
      },
      {
        "id": "B",
        "text": "14"
      },
      {
        "id": "C",
        "text": "9"
      },
      {
        "id": "D",
        "text": "10"
      }
    ],
    "correctAnswer": "B",
    "explanation": "3 4 + gives 7, then 7 2 * gives 14."
  },
  {
    "id": "DSA-Q16",
    "sessionNumber": 6,
    "skillCode": "DSA-STACK",
    "difficulty": "easy",
    "prompt": "Performing pop on an empty stack causes which situation?",
    "options": [
      {
        "id": "A",
        "text": "Memory leak"
      },
      {
        "id": "B",
        "text": "Stack underflow"
      },
      {
        "id": "C",
        "text": "Collision"
      },
      {
        "id": "D",
        "text": "Stack overflow"
      }
    ],
    "correctAnswer": "B",
    "explanation": "Underflow occurs when taking an element from an empty structure."
  },
  {
    "id": "DSA-Q17",
    "sessionNumber": 7,
    "skillCode": "DSA-QUEUE",
    "difficulty": "easy",
    "prompt": "Which principle does a queue follow?",
    "options": [
      {
        "id": "A",
        "text": "By largest value"
      },
      {
        "id": "B",
        "text": "FIFO (first in, first out)"
      },
      {
        "id": "C",
        "text": "LIFO (last in, first out)"
      },
      {
        "id": "D",
        "text": "Random"
      }
    ],
    "correctAnswer": "B",
    "explanation": "The element enqueued first is dequeued first."
  },
  {
    "id": "DSA-Q18",
    "sessionNumber": 7,
    "skillCode": "DSA-QUEUE",
    "difficulty": "easy",
    "prompt": "Enqueue 1, 2, 3 into an empty queue, then dequeue once. Which element is at the front now?",
    "options": [
      {
        "id": "A",
        "text": "The queue is empty"
      },
      {
        "id": "B",
        "text": "1"
      },
      {
        "id": "C",
        "text": "3"
      },
      {
        "id": "D",
        "text": "2"
      }
    ],
    "correctAnswer": "D",
    "explanation": "Dequeue removes 1, so the next front element is 2."
  },
  {
    "id": "DSA-Q19",
    "sessionNumber": 7,
    "skillCode": "DSA-QUEUE",
    "difficulty": "medium",
    "prompt": "What is the main purpose of a circular queue implemented with an array?",
    "options": [
      {
        "id": "A",
        "text": "To grow the array automatically"
      },
      {
        "id": "B",
        "text": "To reuse the empty slots at the start of the array without shifting elements"
      },
      {
        "id": "C",
        "text": "To allow random access"
      },
      {
        "id": "D",
        "text": "To sort elements automatically"
      }
    ],
    "correctAnswer": "B",
    "explanation": "The front/rear indices wrap around, so the free space at the front is not wasted."
  },
  {
    "id": "DSA-Q20",
    "sessionNumber": 8,
    "skillCode": "DSA-RECURSION",
    "difficulty": "medium",
    "prompt": "A recursive factorial function missing its base case (n = 0 or n = 1) will lead to?",
    "options": [
      {
        "id": "A",
        "text": "It runs faster"
      },
      {
        "id": "B",
        "text": "The result is always 1"
      },
      {
        "id": "C",
        "text": "The result is always 0"
      },
      {
        "id": "D",
        "text": "Infinite recursion and a call stack overflow"
      }
    ],
    "correctAnswer": "D",
    "explanation": "With no stopping point, calls keep stacking up until the stack memory overflows."
  },
  {
    "id": "DSA-Q21",
    "sessionNumber": 9,
    "skillCode": "DSA-SORT",
    "difficulty": "medium",
    "prompt": "What is the worst-case complexity of Quick Sort?",
    "options": [
      {
        "id": "A",
        "text": "O(n)"
      },
      {
        "id": "B",
        "text": "O(n log n)"
      },
      {
        "id": "C",
        "text": "O(n²)"
      },
      {
        "id": "D",
        "text": "O(log n)"
      }
    ],
    "correctAnswer": "C",
    "explanation": "When the pivot is always the smallest or largest element, the partition is highly unbalanced."
  },
  {
    "id": "DSA-Q22",
    "sessionNumber": 9,
    "skillCode": "DSA-SORT",
    "difficulty": "medium",
    "prompt": "What is the time complexity of Merge Sort in all cases?",
    "options": [
      {
        "id": "A",
        "text": "O(n)"
      },
      {
        "id": "B",
        "text": "O(n²)"
      },
      {
        "id": "C",
        "text": "O(log n)"
      },
      {
        "id": "D",
        "text": "O(n log n)"
      }
    ],
    "correctAnswer": "D",
    "explanation": "The array is halved log n times and merging each level costs O(n)."
  },
  {
    "id": "DSA-Q23",
    "sessionNumber": 10,
    "skillCode": "DSA-TREE",
    "difficulty": "easy",
    "prompt": "In what order does a preorder traversal of a binary tree visit the nodes?",
    "options": [
      {
        "id": "A",
        "text": "Right, root, left"
      },
      {
        "id": "B",
        "text": "Left, root, right"
      },
      {
        "id": "C",
        "text": "Left, right, root"
      },
      {
        "id": "D",
        "text": "Root, left, right"
      }
    ],
    "correctAnswer": "D",
    "explanation": "Preorder visits the root first, then the left subtree, then the right subtree."
  },
  {
    "id": "DSA-Q24",
    "sessionNumber": 10,
    "skillCode": "DSA-TREE",
    "difficulty": "medium",
    "prompt": "With the root at level 0, what is the maximum number of nodes at level i of a binary tree?",
    "options": [
      {
        "id": "A",
        "text": "2^(i+1)"
      },
      {
        "id": "B",
        "text": "2i"
      },
      {
        "id": "C",
        "text": "2^i"
      },
      {
        "id": "D",
        "text": "i²"
      }
    ],
    "correctAnswer": "C",
    "explanation": "Each level has at most twice as many nodes as the level above it."
  },
  {
    "id": "DSA-Q25",
    "sessionNumber": 10,
    "skillCode": "DSA-TREE",
    "difficulty": "easy",
    "prompt": "What sequence of keys does an inorder traversal of a binary search tree produce?",
    "options": [
      {
        "id": "A",
        "text": "Ascending"
      },
      {
        "id": "B",
        "text": "Level by level"
      },
      {
        "id": "C",
        "text": "Random"
      },
      {
        "id": "D",
        "text": "Descending"
      }
    ],
    "correctAnswer": "A",
    "explanation": "Left < root < right, so inorder traversal gives a sorted ascending sequence."
  },
  {
    "id": "DSA-Q26",
    "sessionNumber": 11,
    "skillCode": "DSA-TREE",
    "difficulty": "medium",
    "prompt": "Insert 50, 30, 70, 20, 40 in that order into an empty BST. What is the preorder traversal?",
    "options": [
      {
        "id": "A",
        "text": "50 30 70 20 40"
      },
      {
        "id": "B",
        "text": "20 40 30 70 50"
      },
      {
        "id": "C",
        "text": "20 30 40 50 70"
      },
      {
        "id": "D",
        "text": "50 30 20 40 70"
      }
    ],
    "correctAnswer": "D",
    "explanation": "Root 50, left child 30 (with children 20 and 40), right child 70; preorder: 50, 30, 20, 40, 70."
  },
  {
    "id": "DSA-Q27",
    "sessionNumber": 11,
    "skillCode": "DSA-TREE",
    "difficulty": "medium",
    "prompt": "If keys already sorted in ascending order are inserted into an empty BST, what is the search complexity afterwards?",
    "options": [
      {
        "id": "A",
        "text": "O(n log n)"
      },
      {
        "id": "B",
        "text": "O(n)"
      },
      {
        "id": "C",
        "text": "O(log n)"
      },
      {
        "id": "D",
        "text": "O(1)"
      }
    ],
    "correctAnswer": "B",
    "explanation": "The tree degenerates into a linked list, so its height is n."
  },
  {
    "id": "DSA-Q28",
    "sessionNumber": 12,
    "skillCode": "DSA-TREE",
    "difficulty": "easy",
    "prompt": "What is the balance condition of an AVL tree?",
    "options": [
      {
        "id": "A",
        "text": "The left subtree is always taller than the right"
      },
      {
        "id": "B",
        "text": "All leaf nodes are at the same level"
      },
      {
        "id": "C",
        "text": "For every node, the heights of its two subtrees differ by at most 1"
      },
      {
        "id": "D",
        "text": "Both subtrees have the same number of nodes"
      }
    ],
    "correctAnswer": "C",
    "explanation": "The balance factor of every node must be in {-1, 0, 1}."
  },
  {
    "id": "DSA-Q29",
    "sessionNumber": 12,
    "skillCode": "DSA-TREE",
    "difficulty": "hard",
    "prompt": "Insert 10, 20, 30 in that order into an empty AVL tree. Which rotation is needed and what is the new root?",
    "options": [
      {
        "id": "A",
        "text": "Right rotation at node 30; the root is 10"
      },
      {
        "id": "B",
        "text": "No rotation; the root stays 10"
      },
      {
        "id": "C",
        "text": "Left-right rotation; the root is 30"
      },
      {
        "id": "D",
        "text": "Left rotation at node 10; the root is 20"
      }
    ],
    "correctAnswer": "D",
    "explanation": "Inserting 30 creates a right-right imbalance at 10, so a left rotation brings 20 up as the root."
  },
  {
    "id": "DSA-Q30",
    "sessionNumber": 12,
    "skillCode": "DSA-TREE",
    "difficulty": "medium",
    "prompt": "What is the height of an AVL tree with n nodes?",
    "options": [
      {
        "id": "A",
        "text": "O(log n)"
      },
      {
        "id": "B",
        "text": "O(√n)"
      },
      {
        "id": "C",
        "text": "O(n)"
      },
      {
        "id": "D",
        "text": "O(1)"
      }
    ],
    "correctAnswer": "A",
    "explanation": "An AVL tree is always nearly balanced, so its height is proportional to log n."
  },
  {
    "id": "DSA-Q31",
    "sessionNumber": 13,
    "skillCode": "DSA-HEAP",
    "difficulty": "easy",
    "prompt": "In a max-heap, what is the relationship between a parent node and its children?",
    "options": [
      {
        "id": "A",
        "text": "Nodes at the same level are equal"
      },
      {
        "id": "B",
        "text": "The parent is smaller than its children"
      },
      {
        "id": "C",
        "text": "The parent's value is greater than or equal to its children's values"
      },
      {
        "id": "D",
        "text": "The left child is always larger than the right"
      }
    ],
    "correctAnswer": "C",
    "explanation": "As a result, the largest element is at the root."
  },
  {
    "id": "DSA-Q32",
    "sessionNumber": 13,
    "skillCode": "DSA-HEAP",
    "difficulty": "medium",
    "prompt": "A heap is stored in an array indexed from 0. At which position is the left child of the node with index i?",
    "options": [
      {
        "id": "A",
        "text": "2i + 2"
      },
      {
        "id": "B",
        "text": "2i + 1"
      },
      {
        "id": "C",
        "text": "i / 2"
      },
      {
        "id": "D",
        "text": "2i"
      }
    ],
    "correctAnswer": "B",
    "explanation": "With zero-based indexing, the left child is at 2i + 1 and the right child at 2i + 2."
  },
  {
    "id": "DSA-Q33",
    "sessionNumber": 14,
    "skillCode": "DSA-GRAPH",
    "difficulty": "easy",
    "prompt": "Which data structure does breadth-first search (BFS) use?",
    "options": [
      {
        "id": "A",
        "text": "Heap"
      },
      {
        "id": "B",
        "text": "Hash table"
      },
      {
        "id": "C",
        "text": "Stack"
      },
      {
        "id": "D",
        "text": "Queue"
      }
    ],
    "correctAnswer": "D",
    "explanation": "BFS visits vertices layer by layer by distance, which matches the FIFO property."
  },
  {
    "id": "DSA-Q34",
    "sessionNumber": 14,
    "skillCode": "DSA-GRAPH",
    "difficulty": "easy",
    "prompt": "Which structure or technique is commonly used for depth-first search (DFS)?",
    "options": [
      {
        "id": "A",
        "text": "Stack or recursion"
      },
      {
        "id": "B",
        "text": "Queue"
      },
      {
        "id": "C",
        "text": "Heap"
      },
      {
        "id": "D",
        "text": "AVL tree"
      }
    ],
    "correctAnswer": "A",
    "explanation": "DFS goes as deep as possible down one branch and then backtracks, which corresponds to a stack or recursion."
  },
  {
    "id": "DSA-Q35",
    "sessionNumber": 14,
    "skillCode": "DSA-GRAPH",
    "difficulty": "medium",
    "prompt": "How much memory does an adjacency matrix of a graph with n vertices take?",
    "options": [
      {
        "id": "A",
        "text": "O(1)"
      },
      {
        "id": "B",
        "text": "O(n)"
      },
      {
        "id": "C",
        "text": "O(n²)"
      },
      {
        "id": "D",
        "text": "O(n log n)"
      }
    ],
    "correctAnswer": "C",
    "explanation": "An adjacency matrix has n × n entries."
  },
  {
    "id": "DSA-Q36",
    "sessionNumber": 14,
    "skillCode": "DSA-GRAPH",
    "difficulty": "medium",
    "prompt": "A complete undirected graph (every pair of vertices is connected) has 5 vertices. How many edges does it have?",
    "options": [
      {
        "id": "A",
        "text": "5"
      },
      {
        "id": "B",
        "text": "10"
      },
      {
        "id": "C",
        "text": "15"
      },
      {
        "id": "D",
        "text": "20"
      }
    ],
    "correctAnswer": "B",
    "explanation": "The number of edges is C(5,2) = 5 × 4 / 2 = 10."
  },
  {
    "id": "DSA-Q37",
    "sessionNumber": 14,
    "skillCode": "DSA-GRAPH",
    "difficulty": "medium",
    "prompt": "When is an adjacency list usually better than an adjacency matrix?",
    "options": [
      {
        "id": "A",
        "text": "When the graph is sparse (few edges)"
      },
      {
        "id": "B",
        "text": "When the number of vertices is very small"
      },
      {
        "id": "C",
        "text": "When the graph is complete"
      },
      {
        "id": "D",
        "text": "When edge lookup must be O(1) for every pair"
      }
    ],
    "correctAnswer": "A",
    "explanation": "An adjacency list stores only the edges that actually exist, taking O(V + E)."
  },
  {
    "id": "DSA-Q38",
    "sessionNumber": 15,
    "skillCode": "DSA-HASH",
    "difficulty": "easy",
    "prompt": "What is a collision in a hash table?",
    "options": [
      {
        "id": "A",
        "text": "The hash function returns a negative value"
      },
      {
        "id": "B",
        "text": "Two different keys are hashed to the same position"
      },
      {
        "id": "C",
        "text": "One key is hashed to two positions"
      },
      {
        "id": "D",
        "text": "The hash table is completely full"
      }
    ],
    "correctAnswer": "B",
    "explanation": "Because the key space is larger than the number of slots, collisions cannot be avoided entirely."
  },
  {
    "id": "DSA-Q39",
    "sessionNumber": 15,
    "skillCode": "DSA-HASH",
    "difficulty": "medium",
    "prompt": "How does collision handling by chaining work?",
    "options": [
      {
        "id": "A",
        "text": "Find the next empty slot in the table"
      },
      {
        "id": "B",
        "text": "Each slot of the table holds a linked list of elements with the same hash index"
      },
      {
        "id": "C",
        "text": "Immediately double the table size"
      },
      {
        "id": "D",
        "text": "Delete the old element"
      }
    ],
    "correctAnswer": "B",
    "explanation": "Colliding keys are appended to the same list at that slot."
  },
  {
    "id": "DSA-Q40",
    "sessionNumber": 15,
    "skillCode": "DSA-HASH",
    "difficulty": "easy",
    "prompt": "With a good hash function and a reasonable load factor, what is the average search complexity in a hash table?",
    "options": [
      {
        "id": "A",
        "text": "O(n log n)"
      },
      {
        "id": "B",
        "text": "O(1)"
      },
      {
        "id": "C",
        "text": "O(log n)"
      },
      {
        "id": "D",
        "text": "O(n)"
      }
    ],
    "correctAnswer": "B",
    "explanation": "The key maps directly to the slot to look up, with few collisions."
  }
];
