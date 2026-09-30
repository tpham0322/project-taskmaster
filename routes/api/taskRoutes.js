const express = require("express");
const Task = require("../../models/Task");
const Project = require("../../models/Project");
const authMiddleware = require("../../utils/authMiddleware");

const router = express.Router();

// Protect all task routes
router.use(authMiddleware);

// POST /api/projects/:projectId/tasks
// Create a task for a project
router.post("/projects/:projectId/tasks", async (req, res) => {
  try {
    const { title, description, status } = req.body;

    // Find the project
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Check project ownership
    if (project.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Forbidden: You do not own this project"
      });
    }

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required"
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      status: status || "To Do",
      project: project._id
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      message: "Server error creating task"
    });
  }
});

// GET /api/projects/:projectId/tasks
// Get all tasks for a project
router.get("/projects/:projectId/tasks", async (req, res) => {
  try {
    // Find the project
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Check project ownership
    if (project.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Forbidden: You do not own this project"
      });
    }

    // Get tasks belonging to project
    const tasks = await Task.find({
      project: project._id
    });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      message: "Server error retrieving tasks"
    });
  }
});

// PUT /api/tasks/:taskId
// Update a task
router.put("/tasks/:taskId", async (req, res) => {
  try {
    const { title, description, status } = req.body;

    // Find the task
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Find the parent project
    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Parent project not found"
      });
    }

    // Check project ownership
    if (project.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Forbidden: You do not own this task"
      });
    }

    // Update fields
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;

    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      message: "Server error updating task"
    });
  }
});

// DELETE /api/tasks/:taskId
// Delete a task
router.delete("/tasks/:taskId", async (req, res) => {
  try {
    // Find the task
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Find the parent project
    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Parent project not found"
      });
    }

    // Check project ownership
    if (project.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Forbidden: You do not own this task"
      });
    }

    await task.deleteOne();

    res.json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      message: "Server error deleting task"
    });
  }
});

module.exports = router;