import {
  removeGSIFields,
  generateUUID,
  getCurrentTimestamp,
} from '../../../utils/common/helpers';

describe('helpers', () => {
  describe('removeGSIFields', () => {
    it('should remove all GSI fields from entity', () => {
      const entity = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        pk1: 'USER',
        sk1: 'EMAIL#test@example.com',
        pk2: 'USER',
        sk2: 'CREATED#2024-01-01',
        pk3: 'pk3-value',
        sk3: 'sk3-value',
        pk4: 'pk4-value',
        sk4: 'sk4-value',
        pk5: 'pk5-value',
        sk5: 'sk5-value',
        pk6: 'pk6-value',
        sk6: 'sk6-value',
      };

      const result = removeGSIFields(entity);

      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(result).not.toHaveProperty('pk1');
      expect(result).not.toHaveProperty('sk1');
      expect(result).not.toHaveProperty('pk2');
      expect(result).not.toHaveProperty('sk2');
      expect(result).not.toHaveProperty('pk3');
      expect(result).not.toHaveProperty('sk3');
      expect(result).not.toHaveProperty('pk4');
      expect(result).not.toHaveProperty('sk4');
      expect(result).not.toHaveProperty('pk5');
      expect(result).not.toHaveProperty('sk5');
      expect(result).not.toHaveProperty('pk6');
      expect(result).not.toHaveProperty('sk6');
    });

    it('should handle entity without GSI fields', () => {
      const entity = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = removeGSIFields(entity);

      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should handle entity with only some GSI fields', () => {
      const entity = {
        id: '123',
        pk1: 'USER',
        sk1: 'EMAIL#test@example.com',
      };

      const result = removeGSIFields(entity);

      expect(result).toEqual({ id: '123' });
    });
  });

  describe('generateUUID', () => {
    it('should generate a valid UUID', () => {
      const uuid = generateUUID();

      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      const uuid3 = generateUUID();

      expect(uuid1).not.toEqual(uuid2);
      expect(uuid2).not.toEqual(uuid3);
      expect(uuid1).not.toEqual(uuid3);
    });
  });

  describe('getCurrentTimestamp', () => {
    it('should return a valid ISO timestamp', () => {
      const timestamp = getCurrentTimestamp();

      // ISO format: 2024-01-01T00:00:00.000Z
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      expect(timestamp).toMatch(isoRegex);
    });

    it('should return current time (within 1 second)', () => {
      const before = new Date().getTime();
      const timestamp = getCurrentTimestamp();
      const after = new Date().getTime();

      const timestampMs = new Date(timestamp).getTime();

      expect(timestampMs).toBeGreaterThanOrEqual(before);
      expect(timestampMs).toBeLessThanOrEqual(after);
    });
  });
});

