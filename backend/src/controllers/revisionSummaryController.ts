import { Request, Response } from 'express';
import * as revisionSummaryService from '../services/revisionSummaryService';

export const getAllRevisionSummaries = async (req: Request, res: Response) => {
  try {
    const revisionSummaries = await revisionSummaryService.getAllRevisionSummaries();
    res.json(revisionSummaries);
  } catch (error) {
    console.error('Error fetching revision summaries:', error);
    res.status(500).json({ error: 'Failed to fetch revision summaries' });
  }
};

export const getRevisionSummaryById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const revisionSummary = await revisionSummaryService.getRevisionSummaryById(id);
    if (!revisionSummary) {
      return res.status(404).json({ error: 'Revision Summary not found' });
    }
    res.json(revisionSummary);
  } catch (error) {
    console.error('Error fetching revision summary:', error);
    res.status(500).json({ error: 'Failed to fetch revision summary' });
  }
};

export const createRevisionSummary = async (req: Request, res: Response) => {
  try {
    const newRevisionSummary = await revisionSummaryService.createRevisionSummary(req.body);
    res.status(201).json(newRevisionSummary);
  } catch (error) {
    console.error('Error creating revision summary:', error);
    res.status(500).json({ error: 'Failed to create revision summary' });
  }
};

export const updateRevisionSummary = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updatedRevisionSummary = await revisionSummaryService.updateRevisionSummary(id, req.body);
    if (!updatedRevisionSummary) {
      return res.status(404).json({ error: 'Revision Summary not found' });
    }
    res.json(updatedRevisionSummary);
  } catch (error) {
    console.error('Error updating revision summary:', error);
    res.status(500).json({ error: 'Failed to update revision summary' });
  }
};

export const deleteRevisionSummary = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const result = await revisionSummaryService.deleteRevisionSummary(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting revision summary:', error);
    res.status(500).json({ error: 'Failed to delete revision summary' });
  }
};
