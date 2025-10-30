import { useState, useEffect } from 'react';
import api from '../api';
import type { BikeCompatibilityTag } from '../types/product';

export const useCompatibilityTags = () => {
  const [tags, setTags] = useState<BikeCompatibilityTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<BikeCompatibilityTag[]>('/api/bike-builder/compatibility-tags/');
      setTags(response.data);
    } catch (err: any) {
      console.error('Error fetching compatibility tags:', err);
      setError(err.message || 'Failed to fetch compatibility tags');
    } finally {
      setLoading(false);
    }
  };

  const getTagsByType = (tagType: 'use_case' | 'budget' | 'physical') => {
    return tags.filter(tag => tag.tag_type === tagType);
  };

  const getTagById = (tagId: number) => {
    return tags.find(tag => tag.id === tagId);
  };

  return {
    tags,
    loading,
    error,
    getTagsByType,
    getTagById,
    refresh: fetchTags,
  };
};

