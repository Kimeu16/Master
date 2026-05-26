import { Request, Response } from 'express';
import * as escalationService from '../services/escalationService';

export const getAllEscalations = async (req: Request, res: Response) => {
  try {
    const escalations = await escalationService.getAllEscalations();
    res.json(escalations);
  } catch (error) {
    console.error('Error fetching escalations:', error);
    res.status(500).json({ error: 'Failed to fetch escalations' });
  }
};

export const getEscalationById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const escalation = await escalationService.getEscalationById(id);
    if (!escalation) {
      return res.status(404).json({ error: 'Escalation not found' });
    }
    res.json(escalation);
  } catch (error) {
    console.error('Error fetching escalation:', error);
    res.status(500).json({ error: 'Failed to fetch escalation' });
  }
};

export const createEscalation = async (req: Request, res: Response) => {
  try {
    const newEscalation = await escalationService.createEscalation(req.body);
    res.status(201).json(newEscalation);
  } catch (error) {
    console.error('Error creating escalation:', error);
    res.status(500).json({ error: 'Failed to create escalation' });
  }
};

export const updateEscalation = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updatedEscalation = await escalationService.updateEscalation(id, req.body);
    if (!updatedEscalation) {
      return res.status(404).json({ error: 'Escalation not found' });
    }
    res.json(updatedEscalation);
  } catch (error) {
    console.error('Error updating escalation:', error);
    res.status(500).json({ error: 'Failed to update escalation' });
  }
};

export const deleteEscalation = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const result = await escalationService.deleteEscalation(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting escalation:', error);
    res.status(500).json({ error: 'Failed to delete escalation' });
  }
};
