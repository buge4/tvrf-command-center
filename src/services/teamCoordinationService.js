class TeamCoordinationService {
  constructor(supabaseService) {
    this.supabaseService = supabaseService;
    this.agentTypes = {
      SYSTEM_ANALYST: 'SystemAnalyst',
      DEVELOPMENT: 'Development',
      MONITORING: 'Monitoring',
      STRATEGY: 'Strategy',
      SECURITY: 'Security'
    };
    
    this.agentWeights = {
      [this.agentTypes.SYSTEM_ANALYST]: 0.25,
      [this.agentTypes.DEVELOPMENT]: 0.25,
      [this.agentTypes.MONITORING]: 0.20,
      [this.agentTypes.STRATEGY]: 0.20,
      [this.agentTypes.SECURITY]: 0.10
    };
    
    this.consensusThresholds = {
      CRITICAL: 0.8,  // 4/5 agents
      MAJOR: 0.6,     // 3/5 agents
      MINOR: 0.4      // 2/5 agents
    };
  }

  /**
   * Create a new team coordination session
   */
  async createTeamSession(sessionName, sessionType = 'development', coordinatorAgent = 'AICommander') {
    try {
      const participants = Object.values(this.agentTypes);
      const consensusThreshold = sessionType === 'emergency' ? 0.8 : 0.6;
      
      const result = await this.supabaseService.insert('team_sessions', {
        session_name: sessionName,
        session_type: sessionType,
        status: 'active',
        consensus_threshold: consensusThreshold,
        participants: participants,
        coordinator_agent: coordinatorAgent,
        metadata: {
          created_with: 'TeamCoordinationService',
          version: '1.0'
        }
      });
      
      return {
        success: true,
        sessionId: result.data[0].id,
        session: result.data[0]
      };
    } catch (error) {
      console.error('Create team session error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add agent contribution to team session
   */
  async addAgentContribution(sessionId, agentId, agentType, contributionType, content, confidenceScore = 0.8) {
    try {
      const result = await this.supabaseService.insert('agent_contributions', {
        team_session_id: sessionId,
        agent_id: agentId,
        agent_type: agentType,
        contribution_type: contributionType,
        content: content,
        confidence_score: confidenceScore
      });
      
      return {
        success: true,
        contribution: result.data[0]
      };
    } catch (error) {
      console.error('Add agent contribution error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build consensus among agents
   */
  async buildConsensus(sessionId, decisionTopic, decisionCategory, agentRecommendations) {
    try {
      const startTime = Date.now();
      const requiredVotes = Math.ceil(Object.keys(this.agentTypes).length * this.consensusThresholds[decisionCategory]);
      
      // Create consensus record
      const consensusRecord = await this.supabaseService.insert('team_consensus', {
        team_session_id: sessionId,
        decision_topic: decisionTopic,
        decision_category: decisionCategory,
        required_votes: requiredVotes,
        conflicting_opinions: this.identifyConflicts(agentRecommendations)
      });
      
      const consensusId = consensusRecord.data[0].id;
      
      // Calculate weighted consensus
      const consensusResult = await this.calculateWeightedConsensus(agentRecommendations);
      const consensusTime = Date.now() - startTime;
      
      // Update consensus record
      await this.supabaseService.update('team_consensus', consensusId, {
        consensus_reached: consensusResult.consensus,
        actual_votes: consensusResult.totalVotes,
        final_decision: consensusResult.decision,
        consensus_time_ms: consensusTime,
        resolution_method: consensusResult.resolutionMethod
      });
      
      // Approve winning contributions
      if (consensusResult.consensus) {
        await this.approveWinningContributions(agentRecommendations, consensusResult.winningAgents);
      }
      
      return {
        success: true,
        consensus: consensusResult.consensus,
        consensusId: consensusId,
        votes: consensusResult.totalVotes,
        required: requiredVotes,
        decision: consensusResult.decision,
        consensusTime: consensusTime
      };
    } catch (error) {
      console.error('Build consensus error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate weighted consensus using agent expertise
   */
  async calculateWeightedConsensus(agentRecommendations) {
    const recommendations = Array.isArray(agentRecommendations) ? agentRecommendations : [agentRecommendations];
    
    let totalWeight = 0;
    let supportingWeight = 0;
    let totalVotes = 0;
    const supportingAgents = [];
    const opposingAgents = [];
    
    recommendations.forEach(rec => {
      const agentWeight = this.agentWeights[rec.agentType] || 0.2;
      totalWeight += agentWeight;
      totalVotes++;
      
      if (rec.recommendation === 'APPROVE' || rec.support === true) {
        supportingWeight += agentWeight;
        supportingAgents.push(rec.agentType);
      } else {
        opposingAgents.push(rec.agentType);
      }
    });
    
    const consensusThreshold = 0.6; // 60% weighted support required
    const consensus = (supportingWeight / totalWeight) >= consensusThreshold;
    
    let resolutionMethod = 'weighted_consensus';
    let decision = {};
    
    if (consensus) {
      resolutionMethod = 'unanimous_support';
      decision = {
        status: 'approved',
        supporting_agents: supportingAgents,
        support_percentage: (supportingWeight / totalWeight * 100).toFixed(1)
      };
    } else if (supportingWeight > totalWeight * 0.4) {
      resolutionMethod = 'majority_support';
      decision = {
        status: 'conditional_approval',
        supporting_agents: supportingAgents,
        opposing_agents: opposingAgents,
        support_percentage: (supportingWeight / totalWeight * 100).toFixed(1)
      };
    } else {
      resolutionMethod = 'insufficient_support';
      decision = {
        status: 'rejected',
        supporting_agents: supportingAgents,
        opposing_agents: opposingAgents,
        support_percentage: (supportingWeight / totalWeight * 100).toFixed(1)
      };
    }
    
    return {
      consensus,
      totalWeight,
      supportingWeight,
      totalVotes,
      decision,
      resolutionMethod,
      winningAgents: supportingAgents
    };
  }

  /**
   * Send message between agents
   */
  async sendAgentMessage(sessionId, senderAgent, receiverAgent, messageType, content, priority = 'MEDIUM', requiresResponse = false) {
    try {
      const messageData = {
        team_session_id: sessionId,
        sender_agent: senderAgent,
        receiver_agent: receiverAgent || null, // null for broadcast
        message_type: messageType,
        priority: priority,
        content: content,
        requires_response: requiresResponse,
        response_deadline: requiresResponse ? 
          new Date(Date.now() + 5 * 60 * 1000).toISOString() : null // 5 minutes
      };
      
      const result = await this.supabaseService.insert('team_communications', messageData);
      
      return {
        success: true,
        messageId: result.data[0].id,
        message: result.data[0]
      };
    } catch (error) {
      console.error('Send agent message error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Track agent performance metrics
   */
  async trackAgentPerformance(agentId, sessionId, metricType, metricValue, context = '') {
    try {
      const result = await this.supabaseService.insert('agent_performance', {
        agent_id: agentId,
        team_session_id: sessionId,
        metric_type: metricType,
        metric_value: metricValue,
        measurement_context: context
      });
      
      return {
        success: true,
        metric: result.data[0]
      };
    } catch (error) {
      console.error('Track agent performance error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get team session details
   */
  async getTeamSession(sessionId) {
    try {
      // Get session info
      const sessionResult = await this.supabaseService.select('team_sessions', { id: sessionId });
      
      if (!sessionResult.success || sessionResult.data.length === 0) {
        return {
          success: false,
          error: 'Team session not found'
        };
      }
      
      // Get contributions
      const contributionsResult = await this.supabaseService.select('agent_contributions', { 
        team_session_id: sessionId 
      });
      
      // Get consensus records
      const consensusResult = await this.supabaseService.select('team_consensus', {
        team_session_id: sessionId
      });
      
      // Get communications
      const communicationsResult = await this.supabaseService.select('team_communications', {
        team_session_id: sessionId
      });
      
      return {
        success: true,
        session: sessionResult.data[0],
        contributions: contributionsResult.data || [],
        consensus: consensusResult.data || [],
        communications: communicationsResult.data || []
      };
    } catch (error) {
      console.error('Get team session error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Complete team session
   */
  async completeTeamSession(sessionId, results = {}) {
    try {
      await this.supabaseService.update('team_sessions', sessionId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        metadata: results
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Complete team session error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Helper methods
   */
  identifyConflicts(agentRecommendations) {
    const recommendations = Array.isArray(agentRecommendations) ? agentRecommendations : [agentRecommendations];
    const supportGroups = {};
    
    recommendations.forEach(rec => {
      const key = `${rec.recommendation}_${rec.support}`;
      if (!supportGroups[key]) {
        supportGroups[key] = [];
      }
      supportGroups[key].push(rec.agentType);
    });
    
    // Return groups with more than one agent (potential conflicts)
    return Object.entries(supportGroups)
      .filter(([_, agents]) => agents.length > 1)
      .map(([key, agents]) => ({ position: key, agents }));
  }

  async approveWinningContributions(agentRecommendations, winningAgents) {
    const recommendations = Array.isArray(agentRecommendations) ? agentRecommendations : [agentRecommendations];
    
    for (const rec of recommendations) {
      if (winningAgents.includes(rec.agentType)) {
        await this.supabaseService.update('agent_contributions', rec.contributionId, {
          is_approved: true,
          approval_votes: (rec.approval_votes || 0) + 1
        });
      }
    }
  }

  /**
   * Create emergency response protocol
   */
  async createEmergencyResponse(alertType, alertData) {
    try {
      const emergencySession = await this.createTeamSession(
        `Emergency Response - ${alertType}`,
        'emergency',
        'AICommander'
      );
      
      if (!emergencySession.success) {
        return emergencySession;
      }
      
      // Broadcast emergency alert to all agents
      const emergencyAlert = {
        alert_type: alertType,
        severity: alertData.severity || 'HIGH',
        data: alertData,
        timestamp: new Date().toISOString()
      };
      
      await this.sendAgentMessage(
        emergencySession.sessionId,
        'AICommander',
        null, // Broadcast
        'ALERT',
        emergencyAlert,
        'CRITICAL',
        true
      );
      
      return {
        success: true,
        sessionId: emergencySession.sessionId,
        emergencySession: emergencySession.session
      };
    } catch (error) {
      console.error('Create emergency response error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get team performance analytics
   */
  async getTeamAnalytics(timeRange = '7d') {
    try {
      const timeLimit = new Date();
      if (timeRange === '7d') {
        timeLimit.setDate(timeLimit.getDate() - 7);
      } else if (timeRange === '30d') {
        timeLimit.setDate(timeLimit.getDate() - 30);
      }
      
      // Get session statistics
      const sessionStats = await this.supabaseService.select('team_sessions', {
        created_at: `gte.${timeLimit.toISOString()}`
      });
      
      // Get consensus statistics
      const consensusStats = await this.supabaseService.select('team_consensus', {
        created_at: `gte.${timeLimit.toISOString()}`
      });
      
      // Calculate performance metrics
      const analytics = {
        timeRange,
        totalSessions: sessionStats.data?.length || 0,
        completedSessions: sessionStats.data?.filter(s => s.status === 'completed').length || 0,
        consensusRate: this.calculateConsensusRate(consensusStats.data || []),
        averageConsensusTime: this.calculateAverageConsensusTime(consensusStats.data || []),
        agentParticipation: this.calculateAgentParticipation(sessionStats.data || [])
      };
      
      return {
        success: true,
        analytics
      };
    } catch (error) {
      console.error('Get team analytics error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  calculateConsensusRate(consensusRecords) {
    if (consensusRecords.length === 0) return 0;
    const successful = consensusRecords.filter(c => c.consensus_reached).length;
    return (successful / consensusRecords.length * 100).toFixed(1);
  }

  calculateAverageConsensusTime(consensusRecords) {
    if (consensusRecords.length === 0) return 0;
    const validTimes = consensusRecords.filter(c => c.consensus_time_ms);
    if (validTimes.length === 0) return 0;
    const total = validTimes.reduce((sum, c) => sum + c.consensus_time_ms, 0);
    return Math.round(total / validTimes.length);
  }

  calculateAgentParticipation(sessions) {
    const participation = {};
    
    sessions.forEach(session => {
      (session.participants || []).forEach(agent => {
        if (!participation[agent]) {
          participation[agent] = 0;
        }
        participation[agent]++;
      });
    });
    
    return participation;
  }
}

export default TeamCoordinationService;