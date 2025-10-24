import { createClient } from '@supabase/supabase-js';

class SupabaseService {
  constructor(url, key) {
    this.client = createClient(url, key);
  }

  // Conversation Methods
  async saveConversation(sessionId, message, response, userId = null) {
    try {
      const { data, error } = await this.client
        .from('conversations')
        .insert([{
          session_id: sessionId,
          message: message,
          response: response,
          user_id: userId
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Save conversation error:', error);
      return { success: false, error: error.message };
    }
  }

  async getConversationHistory(sessionId, limit = 50) {
    try {
      const { data, error } = await this.client
        .from('conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get conversation history error:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllConversations(limit = 100) {
    try {
      const { data, error } = await this.client
        .from('conversations')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get all conversations error:', error);
      return { success: false, error: error.message };
    }
  }

  // Project Methods
  async createProject(name, description = '') {
    try {
      const { data, error } = await this.client
        .from('projects')
        .insert([{
          name: name,
          description: description,
          status: 'active'
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Create project error:', error);
      return { success: false, error: error.message };
    }
  }

  async getProjects(status = null) {
    try {
      let query = this.client
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get projects error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateProject(projectId, updates) {
    try {
      const { data, error } = await this.client
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update project error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteProject(projectId) {
    try {
      const { error } = await this.client
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete project error:', error);
      return { success: false, error: error.message };
    }
  }

  // Project Session Methods
  async saveProjectSession(projectId, sessionData) {
    try {
      const { data, error } = await this.client
        .from('project_sessions')
        .insert([{
          project_id: projectId,
          session_data: sessionData
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Save project session error:', error);
      return { success: false, error: error.message };
    }
  }

  async getProjectSessions(projectId) {
    try {
      const { data, error } = await this.client
        .from('project_sessions')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get project sessions error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default SupabaseService;
