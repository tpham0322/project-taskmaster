const express = require("express");
const Project = require("../../models/Project");
const authMiddleware = require("../../utils/authMiddleware");

const router = express.Router();

// Protect all project routes
router.use(authMiddleware);

// POST /api/projects
// Create a new project
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: "Name and description are required"
      });
    }

    const project = await Project.create({
      name,
      description,
      user: req.user.userId
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      message: "Server error creating project"
    });
  }
});

// GET /api/projects
// Get all projects owned by logged-in user
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({
      user: req.user.userId
    });

    res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);

    res.status(500).json({
      message: "Server error retrieving projects"
    });
  }
});

// GET /api/projects/:id
// Get one project owned by logged-in user
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Ownership check
    if (project.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Forbidden: You do not own this project"
      });
    }

    res.json(project);
  } catch (error) {
    console.error("Get project error:", error);

    res.status(500).json({
      message: "Server error retrieving project"
    });
  }
});

// PUT /api/projects/:id
// Update owned project
router.put("/:id", async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Ownership check
    if (project.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Forbidden: You do not own this project"
      });
    }

    project.name = name ?? project.name;
    project.description = description ?? project.description;

    await project.save();

    res.json(project);
  } catch (error) {
    console.error("Update project error:", error);

    res.status(500).json({
      message: "Server error updating project"
    });
  }
});

// DELETE /api/projects/:id
// Delete owned project
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Ownership check
    if (project.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Forbidden: You do not own this project"
      });
    }

    await project.deleteOne();

    res.json({
      message: "Project deleted successfully"
    });
  } catch (error) {
    console.error("Delete project error:", error);

    res.status(500).json({
      message: "Server error deleting project"
    });
  }
});

module.exports = router;