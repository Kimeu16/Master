import { Request, Response } from 'express';
import * as siteService from '../services/siteService';

export const getAllSites = async (req: Request, res: Response) => {
  try {
    const sites = await siteService.getAllSites();
    res.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
};

export const getSiteById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const site = await siteService.getSiteById(id);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    res.json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ error: 'Failed to fetch site' });
  }
};

export const createSite = async (req: Request, res: Response) => {
  try {
    const newSite = await siteService.createSite(req.body);
    res.status(201).json(newSite);
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ error: 'Failed to create site' });
  }
};

export const updateSite = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updatedSite = await siteService.updateSite(id, req.body);
    if (!updatedSite) {
      return res.status(404).json({ error: 'Site not found' });
    }
    res.json(updatedSite);
  } catch (error) {
    console.error('Error updating site:', error);
    res.status(500).json({ error: 'Failed to update site' });
  }
};

export const deleteSite = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const result = await siteService.deleteSite(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({ error: 'Failed to delete site' });
  }
};
