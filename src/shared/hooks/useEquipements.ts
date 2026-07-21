import { useState, useEffect } from 'react';
import { Equipment } from '../types/gmao';
import { equipementService } from '../services/equipement.service';

export const useEquipements = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipementService.getAll();
      setEquipments(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching equipments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipements();
  }, []);

  const addEquipment = async (equipment: Partial<Equipment>) => {
    try {
      const added = await equipementService.create(equipment);
      setEquipments(prev => [...prev, added]);
      return added;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateEquipmentStatus = async (id: string, status: Equipment['status'], healthIndex?: number) => {
    // Optimistic update
    setEquipments(prev => prev.map(eq => 
      eq.id === id ? { ...eq, status, healthIndex: healthIndex ?? eq.healthIndex } : eq
    ));
    try {
      await equipementService.update(id, { status, healthIndex });
    } catch (err) {
      console.error('Update failed, rolling back');
      fetchEquipements(); // Re-sync on failure
      throw err;
    }
  };

  const deleteEquipment = async (id: string) => {
    // Optimistic delete
    setEquipments(prev => prev.filter(eq => eq.id !== id));
    try {
      await equipementService.delete(id);
    } catch (err) {
      console.error('Delete failed, rolling back');
      fetchEquipements();
      throw err;
    }
  };

  return {
    equipments,
    loading,
    error,
    refetch: fetchEquipements,
    addEquipment,
    updateEquipmentStatus,
    deleteEquipment,
  };
};
