import { Request, Response } from 'express';
import * as pmChecklistService from '../services/pmChecklistService';

export const getAllPMChecklists = async (req: Request, res: Response) => {
  try {
    const pmChecklists = await pmChecklistService.getAllPMChecklists();
    res.json(pmChecklists);
  } catch (error) {
    console.error('Error fetching PM checklists:', error);
    res.status(500).json({ error: 'Failed to fetch PM checklists' });
  }
};

export const getPMChecklistById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const pmChecklist = await pmChecklistService.getPMChecklistById(id);
    if (!pmChecklist) {
      return res.status(404).json({ error: 'PM Checklist not found' });
    }
    res.json(pmChecklist);
  } catch (error) {
    console.error('Error fetching PM checklist:', error);
    res.status(500).json({ error: 'Failed to fetch PM checklist' });
  }
};

export const createPMChecklist = async (req: Request, res: Response) => {
  try {
    const newPMChecklist = await pmChecklistService.createPMChecklist(req.body);
    res.status(201).json(newPMChecklist);
  } catch (error) {
    console.error('Error creating PM checklist:', error);
    res.status(500).json({ error: 'Failed to create PM checklist' });
  }
};

export const updatePMChecklist = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updatedPMChecklist = await pmChecklistService.updatePMChecklist(id, req.body);
    if (!updatedPMChecklist) {
      return res.status(404).json({ error: 'PM Checklist not found' });
    }
    res.json(updatedPMChecklist);
  } catch (error) {
    console.error('Error updating PM checklist:', error);
    res.status(500).json({ error: 'Failed to update PM checklist' });
  }
};

export const deletePMChecklist = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const result = await pmChecklistService.deletePMChecklist(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting PM checklist:', error);
    res.status(500).json({ error: 'Failed to delete PM checklist' });
  }
};
