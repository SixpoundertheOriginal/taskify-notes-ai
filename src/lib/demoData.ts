
import { v4 as uuidv4 } from 'uuid';
import { Task, Priority, Status } from './types';

// Helper function to create dates relative to today
const getRelativeDate = (dayOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString();
};

// Create a reminder time for a specific hour today
const getReminderTime = (hour: number, minutes: number = 0): string => {
  const date = new Date();
  date.setHours(hour, minutes, 0, 0);
  return date.toISOString();
};

export const demoTasks: Task[] = [
  {
    id: uuidv4(),
    title: "Complete project proposal",
    description: "Draft the project proposal document for the new client project including timeline, budget, and deliverables.",
    completed: false,
    priority: "high",
    status: "in-progress",
    dueDate: getRelativeDate(2),
    reminderTime: getReminderTime(10),
    createdAt: getRelativeDate(-2),
    subtasks: [
      {
        id: uuidv4(),
        title: "Research client requirements",
        completed: true
      },
      {
        id: uuidv4(),
        title: "Outline project scope",
        completed: true
      },
      {
        id: uuidv4(),
        title: "Calculate budget estimates",
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Review and respond to emails",
    description: "Check inbox and respond to all pending emails. Flag important ones for follow-up.",
    completed: false,
    priority: "medium",
    status: "todo",
    dueDate: getRelativeDate(0),
    createdAt: getRelativeDate(-1),
    subtasks: []
  },
  {
    id: uuidv4(),
    title: "Prepare for team meeting",
    description: "Create agenda, gather progress updates, and prepare slides for the weekly team meeting.",
    completed: false,
    priority: "high",
    status: "todo",
    dueDate: getRelativeDate(1),
    reminderTime: getReminderTime(9, 30),
    createdAt: getRelativeDate(-3),
    subtasks: [
      {
        id: uuidv4(),
        title: "Collect status updates from team",
        completed: false
      },
      {
        id: uuidv4(),
        title: "Prepare presentation slides",
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Schedule doctor appointment",
    description: "Call the clinic to schedule annual checkup.",
    completed: true,
    priority: "medium",
    status: "completed",
    createdAt: getRelativeDate(-5),
    subtasks: []
  },
  {
    id: uuidv4(),
    title: "Buy groceries",
    description: "Get items for the week: vegetables, fruits, milk, bread, and eggs.",
    completed: false,
    priority: "low",
    status: "todo",
    dueDate: getRelativeDate(3),
    createdAt: getRelativeDate(-1),
    subtasks: [
      {
        id: uuidv4(),
        title: "Make shopping list",
        completed: true
      },
      {
        id: uuidv4(),
        title: "Check pantry for existing items",
        completed: true
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Update portfolio website",
    description: "Add recent projects and refresh design of personal portfolio site.",
    completed: false,
    priority: "low",
    status: "todo",
    dueDate: getRelativeDate(14),
    createdAt: getRelativeDate(-7),
    subtasks: []
  },
  {
    id: uuidv4(),
    title: "Plan team building activity",
    description: "Research and organize a team building activity for the department.",
    completed: false,
    priority: "medium",
    status: "todo",
    dueDate: getRelativeDate(10),
    createdAt: getRelativeDate(-4),
    subtasks: []
  },
  {
    id: uuidv4(),
    title: "Submit expense reports",
    description: "Compile receipts and submit expense reports for last month's business trip.",
    completed: true,
    priority: "high",
    status: "completed",
    createdAt: getRelativeDate(-10),
    subtasks: []
  }
];
