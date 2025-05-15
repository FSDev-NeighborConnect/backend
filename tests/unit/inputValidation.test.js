const { validationResult } = require('express-validator');
const {
  validateGetAllUsers,
  validateEventCreation,
  validateSignUp
} = require('../../middleware/validator.js');
const { sanitizeInputFields } = require('../../middleware/sanitize.js');

describe('Custom Middleware Validators', () => {
  // Helper to mock res
  const getMockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  describe('validateGetAllUsers', () => {
    it('allows safe query params', () => {
      const req = { query: { foo: 'bar' } };
      const res = getMockRes();
      const next = jest.fn();

      validateGetAllUsers(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('blocks queries with $ in key', () => {
      const req = { query: { '$where': '1==1' } };
      const res = getMockRes();
      const next = jest.fn();

      validateGetAllUsers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Suspicious query parameters are not allowed.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('blocks queries containing "password"', () => {
      const req = { query: { password: 'hunter2' } };
      const res = getMockRes();
      const next = jest.fn();

      validateGetAllUsers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('sanitizeInputFields', () => {
    it('strips HTML/script tags from specified fields', () => {
      const req = {
        body: {
          title: '<script>alert(1)</script>Hi',
          description: '<b>Desc</b> is here'
        }
      };
      const res = getMockRes();
      const next = jest.fn();

      const mw = sanitizeInputFields(['title', 'description']);
      mw(req, res, next);

      expect(req.body.title).toBe('Hi');
      expect(req.body.description).toBe('Desc is here');
      expect(next).toHaveBeenCalled();
    });

    it('skips keys that don`t exist', () => {
      const req = { body: {} };
      const res = getMockRes();
      const next = jest.fn();

      const mw = sanitizeInputFields(['nonexistent']);
      mw(req, res, next);

      expect(req.body.nonexistent).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateEventCreation (endTime > startTime)', () => {
    // Helper to run the full array of middlewares and collect errors
    const runEventCreation = async (body) => {
      const req = { body };
      const res = getMockRes();
      const next = jest.fn();

      for (const mw of validateEventCreation) {
        // express validator middleware return a promise if they use async checks
        await mw(req, res, next);
      }
      return validationResult(req);
    };

    it('rejects if endTime is before startTime', async () => {
      const errors = await runEventCreation({
        title: 'Test Event',
        description: 'Something',
        date: '2025-06-01',
        startTime: '2025-06-01T12:00:00Z',
        endTime: '2025-06-01T10:00:00Z',
        streetAddress: '123 Main St',
        postalCode: '12345'
      });

      expect(errors.isEmpty()).toBe(false);
      const msgs = errors.array().map(e => e.msg);
      expect(msgs).toContain('End time must be after start time');
    });

    it('passes when endTime is after startTime', async () => {
      const errors = await runEventCreation({
        title: 'Test Event',
        description: 'Something here',
        date: '2025-06-01',
        startTime: '2025-06-01T10:00:00Z',
        endTime: '2025-06-01T12:00:00Z',
        streetAddress: '123 Main St',
        postalCode: '12345'
      });

      expect(errors.isEmpty()).toBe(true);
    });
  });

  describe('validateSignUp (name length rule)', () => {
    const runSignUp = async (body) => {
      const req = { body };
      const res = getMockRes();
      const next = jest.fn();

      for (const mw of validateSignUp) {
        await mw(req, res, next);
      }
      return validationResult(req);
    };

    it('rejects when name is too short', async () => {
      const errors = await runSignUp({
        name: 'Jo',
        email: 'joe@example.com',
        password: 'Password1!',
        streetAddress: '123 Main',
        postalCode: '12345',
        phone: '01234567890'
      });

      expect(errors.isEmpty()).toBe(false);
      const msgs = errors.array().map(e => e.msg);
      expect(msgs).toContain('Name must be at least 4 characters');
    });

    it('passes with all valid fields', async () => {
      const errors = await runSignUp({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'P@ssw0rd!',
        streetAddress: '456 Elm St',
        postalCode: '54321',
        phone: '019876543210'
      });

      expect(errors.isEmpty()).toBe(true);
    });
  });
});
