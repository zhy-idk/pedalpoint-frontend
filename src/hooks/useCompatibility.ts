import { useState, useEffect } from 'react';
import api from '../api';
import type { 
  CompatibilityGroup, 
  CompatibilityAttribute, 
  CompatibilityAttributeValue 
} from '../types/product';

export const useCompatibility = () => {
  const [groups, setGroups] = useState<CompatibilityGroup[]>([]);
  const [attributes, setAttributes] = useState<CompatibilityAttribute[]>([]);
  const [values, setValues] = useState<CompatibilityAttributeValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompatibilityData();
  }, []);

  const fetchCompatibilityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all compatibility data
      const [groupsRes, attributesRes, valuesRes] = await Promise.all([
        api.get<CompatibilityGroup[]>('/api/compatibility/groups/'),
        api.get<CompatibilityAttribute[]>('/api/compatibility/attributes/'),
        api.get<CompatibilityAttributeValue[]>('/api/compatibility/values/'),
      ]);

      setGroups(groupsRes.data);
      setAttributes(attributesRes.data);
      setValues(valuesRes.data);
    } catch (err: any) {
      console.error('Error fetching compatibility data:', err);
      setError(err.message || 'Failed to fetch compatibility data');
    } finally {
      setLoading(false);
    }
  };

  const getValuesByAttribute = (attributeId: number) => {
    return values.filter(v => v.attribute.id === attributeId);
  };

  const getAttributesByGroup = (groupId: number) => {
    return attributes.filter(a => a.group.id === groupId);
  };

  const getValueById = (valueId: number) => {
    return values.find(v => v.id === valueId);
  };

  return {
    groups,
    attributes,
    values,
    loading,
    error,
    getValuesByAttribute,
    getAttributesByGroup,
    getValueById,
    refresh: fetchCompatibilityData,
  };
};

