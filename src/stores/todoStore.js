import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

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
        count: 0,
        totalTime: 0
    })

    // Pomodoro Cycle Tracking
    const pomodorosSinceLongBreak = ref(0)

    // Timer Settings (in minutes)
    const timerSettings = ref({
        work: 25,
        shortBreak: 5,
        longBreak: 15
    })

    // --- Persistence ---
    const fileHandle = ref(null)

    function saveToLocalStorage() {
        const data = {
            todos: todos.value,
            categories: categories.value,
            timerSettings: timerSettings.value,
            dailyStats: dailyStats.value,
            pomodorosSinceLongBreak: pomodorosSinceLongBreak.value
        }
        localStorage.setItem('pomodoro-todo-data', JSON.stringify(data))
    }

    function loadFromLocalStorage() {
        const data = localStorage.getItem('pomodoro-todo-data')
        if (data) {
            try {
                const parsed = JSON.parse(data)
                if (parsed.todos) todos.value = parsed.todos
                if (parsed.categories) categories.value = parsed.categories
                if (parsed.timerSettings) timerSettings.value = parsed.timerSettings
                if (parsed.dailyStats) dailyStats.value = parsed.dailyStats
                if (parsed.pomodorosSinceLongBreak) pomodorosSinceLongBreak.value = parsed.pomodorosSinceLongBreak
            } catch (e) {
                console.error('Failed to parse local storage data', e)
            }
        }
    }

    // Initialize from LocalStorage immediately
    loadFromLocalStorage()

    // Watch for changes
    watch([todos, categories, timerSettings, dailyStats, pomodorosSinceLongBreak], () => {
        saveToLocalStorage()
        if (fileHandle.value) {
            saveToJSON()
        }
    }, { deep: true })

    async function selectSaveFile() {
        try {
            const handle = await window.showSaveFilePicker({
                types: [{
                    description: 'JSON File',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            fileHandle.value = handle;
            await saveToJSON(); // Initial save to the file
        } catch (err) {
            console.error('File selection cancelled or failed', err);
        }
    }

    async function loadFromFile() {
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{
                    description: 'JSON File',
                    accept: { 'application/json': ['.json'] },
                }],
                multiple: false
            });
            fileHandle.value = handle;
            const file = await handle.getFile();
            const contents = await file.text();

            try {
                const parsed = JSON.parse(contents);
                // Update state
                if (parsed.todos) todos.value = parsed.todos
                if (parsed.categories) categories.value = parsed.categories
                if (parsed.timerSettings) timerSettings.value = parsed.timerSettings
                if (parsed.dailyStats) dailyStats.value = parsed.dailyStats
                if (parsed.pomodorosSinceLongBreak) pomodorosSinceLongBreak.value = parsed.pomodorosSinceLongBreak

                // Save to local storage as well to sync
                saveToLocalStorage()
            } catch (parseErr) {
                console.error('Invalid JSON file', parseErr);
                alert('Invalid JSON file');
            }
        } catch (err) {
            console.error('File load cancelled or failed', err);
        }
    }

    async function saveToJSON() {
        if (!fileHandle.value) return;
        try {
            const writable = await fileHandle.value.createWritable();
            const data = {
                todos: todos.value,
                categories: categories.value,
                timerSettings: timerSettings.value,
                dailyStats: dailyStats.value,
                pomodorosSinceLongBreak: pomodorosSinceLongBreak.value
            };
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
        } catch (err) {
            console.error('Failed to save to JSON file', err);
        }
    }

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



    const nextBreakMode = computed(() => {
        return pomodorosSinceLongBreak.value >= 4 ? 'longBreak' : 'shortBreak'
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
            images: [],
            repeat: todo.repeat || 'None',
            createdAt: new Date()
        })
    }

    function updateTodo(id, updates) {
        const todo = todos.value.find(t => t.id === id)
        if (todo) {
            Object.assign(todo, updates)
        }
    }

    function toggleTodo(id) {
        const todo = todos.value.find(t => t.id === id)
        if (todo) {
            const wasCompleted = todo.completed
            todo.completed = !todo.completed

            // Handle Repeating Todos (only when marking as completed)
            if (!wasCompleted && todo.completed && todo.repeat && todo.repeat !== 'None') {
                const nextDate = new Date()
                // If it has a due date, repeat based on that, otherwise based on today
                const baseDate = todo.dueDate ? new Date(todo.dueDate) : new Date()

                // Prevent past dates loop if user completes old todo: always project from Today if overdue?
                // Actually safer to project from "max(dueDate, today)" or just base logic.
                // Let's stick to simple logic: modify baseDate.

                switch (todo.repeat) {
                    case 'Daily':
                        baseDate.setDate(baseDate.getDate() + 1)
                        break
                    case 'Weekly':
                        baseDate.setDate(baseDate.getDate() + 7)
                        break
                    case 'Monthly':
                        baseDate.setMonth(baseDate.getMonth() + 1)
                        break
                }

                const nextDueDateStr = baseDate.toISOString().split('T')[0]

                // Create the next occurrence
                todos.value.push({
                    ...JSON.parse(JSON.stringify(todo)), // Deep copy properties
                    id: Date.now().toString(),
                    completed: false,
                    pomodoros: 0,
                    dueDate: nextDueDateStr,
                    createdAt: new Date(),
                    // Keep original repeat setting
                })
            }

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
            dailyStats.value = { date: today, count: 0, totalTime: 0 }
        }
    }

    function completePomodoro() {
        checkDailyReset()
        dailyStats.value.count++
        // Add work duration to total time (defaulting to 0 if undefined for safety, though it should be set)
        dailyStats.value.totalTime = (dailyStats.value.totalTime || 0) + timerSettings.value.work
        pomodorosSinceLongBreak.value++

        // Increment pomodoro count for active todo
        if (activeTodoId.value) {
            const todo = todos.value.find(t => t.id === activeTodoId.value)
            if (todo) {
                todo.pomodoros = (todo.pomodoros || 0) + 1
            }
        }
    }

    function resetPomodoroCycle() {
        pomodorosSinceLongBreak.value = 0
    }

    function addCategory(name) {
        if (!name) return
        if (!categories.value.includes(name)) {
            categories.value.push(name)
        }
    }

    function deleteCategory(name) {
        categories.value = categories.value.filter(c => c !== name)
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


    // --- Image Actions ---
    function addImage(todoId, image) {
        const todo = todos.value.find(t => t.id === todoId)
        if (todo) {
            if (!todo.images) todo.images = []
            todo.images.push(image)
        }
    }

    function removeImage(todoId, imageId) {
        const todo = todos.value.find(t => t.id === todoId)
        if (todo && todo.images) {
            todo.images = todo.images.filter(img => img.id !== imageId)
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
        updateTodo,
        toggleTodo,
        deleteTodo,
        setFocusTodo,
        updateTimerSettings,
        setSortBy,
        completePomodoro,
        updateTodoNotes,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        pomodorosSinceLongBreak,
        nextBreakMode,
        resetPomodoroCycle,
        addCategory,

        deleteCategory,
        addImage,
        removeImage,

        // Persistence
        selectSaveFile,
        loadFromFile,
        fileHandle
    }
})
