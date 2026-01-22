import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTodoStore = defineStore('todo', () => {
    // --- State ---
    const todos = ref([])
    const activeTodoId = ref(null)
    const categories = ref(['Arbeit', 'Privat', 'Studium', 'Fitness'])

    // Sorting
    const sortBy = ref('priority') // 'priority', 'category', 'date'
    const sortOrder = ref('desc') // 'asc', 'desc'

    // Daily Statistics (resets each day)
    const dailyStats = ref({
        date: new Date().toLocaleDateString(),
        count: 0
    })

    // Timer Settings (in minutes)
    const timerSettings = ref({
        work: 25,
        shortBreak: 5,
        longBreak: 15
    })

    // --- Getters ---
    const activeTodo = computed(() => {
        return todos.value.find(t => t.id === activeTodoId.value) || null
    })

    const todosByPriority = computed(() => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 }
        return [...todos.value].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1
            return priorityOrder[b.priority] - priorityOrder[a.priority]
        })
    })

    const sortedTodos = computed(() => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 }
        const categoryOrder = [...categories.value]

        return [...todos.value].sort((a, b) => {
            // Completed tasks always at the bottom
            if (a.completed !== b.completed) return a.completed ? 1 : -1

            let comparison = 0

            switch (sortBy.value) {
                case 'priority':
                    comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
                    break
                case 'category':
                    comparison = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
                    break
                case 'date':
                    const dateA = a.dueDate ? new Date(a.dueDate + (a.dueTime ? 'T' + a.dueTime : 'T23:59')) : null
                    const dateB = b.dueDate ? new Date(b.dueDate + (b.dueTime ? 'T' + b.dueTime : 'T23:59')) : null

                    if (!dateA && !dateB) comparison = 0
                    else if (!dateA) comparison = 1
                    else if (!dateB) comparison = -1
                    else comparison = dateA - dateB
                    break
                default:
                    comparison = 0
            }

            return sortOrder.value === 'asc' ? -comparison : comparison
        })
    })

    // --- Actions ---
    function addTodo(todo) {
        todos.value.push({
            id: Date.now().toString(),
            text: todo.text,
            category: todo.category,
            priority: todo.priority,
            dueDate: todo.dueDate || null,
            dueTime: todo.dueTime || null,
            completed: false,
            estimatedPomodoros: todo.estimatedPomodoros || 1,
            notes: '',
            subtasks: [],
            pomodoros: 0,
            createdAt: new Date()
        })
    }

    function toggleTodo(id) {
        const todo = todos.value.find(t => t.id === id)
        if (todo) {
            todo.completed = !todo.completed

            // Auto-queue logic
            if (todo.completed && activeTodoId.value === id) {
                // Find the next incomplete todo in the sorted list
                const sorted = sortedTodos.value
                const currentIndex = sorted.findIndex(t => t.id === id)

                // Look for next incomplete todo after current one
                let nextTodo = sorted.slice(currentIndex + 1).find(t => !t.completed)

                if (!nextTodo) {
                    // If none found after, wrap around or just check from start (excluding current)
                    nextTodo = sorted.find(t => !t.completed && t.id !== id)
                }

                if (nextTodo) {
                    activeTodoId.value = nextTodo.id
                } else {
                    activeTodoId.value = null
                }
            } else if (!todo.completed && !activeTodoId.value) {
                // If uncompleting and no active todo, maybe set this one active? 
                // Optional, but sticking to user request for queueing *next* on completion.
            }
        }
    }

    function deleteTodo(id) {
        todos.value = todos.value.filter(t => t.id !== id)
        if (activeTodoId.value === id) {
            activeTodoId.value = null
        }
    }

    function setFocusTodo(id) {
        activeTodoId.value = id
    }

    function updateTimerSettings(newSettings) {
        timerSettings.value = { ...timerSettings.value, ...newSettings }
    }

    function setSortBy(newSortBy) {
        if (sortBy.value === newSortBy) {
            // Toggle order if same sort field
            sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
        } else {
            sortBy.value = newSortBy
            sortOrder.value = 'desc'
        }
    }

    function checkDailyReset() {
        const today = new Date().toLocaleDateString()
        if (dailyStats.value.date !== today) {
            dailyStats.value = { date: today, count: 0 }
        }
    }

    function completePomodoro() {
        checkDailyReset()
        dailyStats.value.count++

        // Increment pomodoro count for active todo
        if (activeTodoId.value) {
            const todo = todos.value.find(t => t.id === activeTodoId.value)
            if (todo) {
                todo.pomodoros = (todo.pomodoros || 0) + 1
            }
        }
    }

    // --- Subtask & Note Actions ---
    function updateTodoNotes(todoId, notes) {
        const todo = todos.value.find(t => t.id === todoId)
        if (todo) {
            todo.notes = notes
        }
    }

    function addSubtask(todoId, text) {
        const todo = todos.value.find(t => t.id === todoId)
        if (todo) {
            if (!todo.subtasks) todo.subtasks = []
            todo.subtasks.push({
                id: Date.now().toString(),
                text,
                completed: false
            })
        }
    }

    function toggleSubtask(todoId, subtaskId) {
        const todo = todos.value.find(t => t.id === todoId)
        if (todo && todo.subtasks) {
            const subtask = todo.subtasks.find(s => s.id === subtaskId)
            if (subtask) {
                subtask.completed = !subtask.completed
            }
        }
    }

    function deleteSubtask(todoId, subtaskId) {
        const todo = todos.value.find(t => t.id === todoId)
        if (todo && todo.subtasks) {
            todo.subtasks = todo.subtasks.filter(s => s.id !== subtaskId)
        }
    }

    return {
        todos,
        activeTodoId,
        categories,
        timerSettings,
        dailyStats,
        sortBy,
        sortOrder,
        activeTodo,
        todosByPriority,
        sortedTodos,
        addTodo,
        toggleTodo,
        deleteTodo,
        setFocusTodo,
        updateTimerSettings,
        setSortBy,
        completePomodoro,
        updateTodoNotes,
        addSubtask,
        toggleSubtask,
        deleteSubtask
    }
})
