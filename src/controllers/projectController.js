class ProjectController {
  constructor(supabaseService) {
    this.supabaseService = supabaseService;
  }

  async createProject(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Project name is required'
        });
      }

      const result = await this.supabaseService.createProject(name, description);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error('Create project error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getProjects(req, res) {
    try {
      const { status } = req.query;

      const result = await this.supabaseService.getProjects(status);

      return res.json(result);
    } catch (error) {
      console.error('Get projects error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
      }

      const result = await this.supabaseService.updateProject(id, updates);

      return res.json(result);
    } catch (error) {
      console.error('Update project error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteProject(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
      }

      const result = await this.supabaseService.deleteProject(id);

      return res.json(result);
    } catch (error) {
      console.error('Delete project error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async saveProjectSession(req, res) {
    try {
      const { projectId, sessionData } = req.body;

      if (!projectId || !sessionData) {
        return res.status(400).json({
          success: false,
          error: 'Project ID and session data are required'
        });
      }

      const result = await this.supabaseService.saveProjectSession(
        projectId,
        sessionData
      );

      return res.status(201).json(result);
    } catch (error) {
      console.error('Save project session error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getProjectSessions(req, res) {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
      }

      const result = await this.supabaseService.getProjectSessions(projectId);

      return res.json(result);
    } catch (error) {
      console.error('Get project sessions error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default ProjectController;
