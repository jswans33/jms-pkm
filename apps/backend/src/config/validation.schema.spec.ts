import { SECRET_MIN_LENGTH } from './constants';
import { validationSchema } from './validation.schema';

describe('validationSchema', () => {
  it('returns defaulted values when env is empty', () => {
    const { error, value } = validationSchema.validate({}, { abortEarly: false });

    expect(error).toBeUndefined();
    expect(value.NODE_ENV).toBe('development');
    expect(value.PORT).toBeUndefined();
    expect(value.DB_PORT).toBe(5432);
    expect(value.REDIS_PORT).toBe(6379);
    expect(value.JWT_SECRET.length).toBeGreaterThanOrEqual(SECRET_MIN_LENGTH);
  });

  it('fails validation when secrets do not meet length requirements', () => {
    const { error } = validationSchema.validate(
      {
        JWT_SECRET: 'short-secret',
        SESSION_SECRET: 'short-secret',
      },
      { abortEarly: false },
    );

    expect(error).toBeDefined();
    expect(error?.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ['JWT_SECRET'] }),
        expect.objectContaining({ path: ['SESSION_SECRET'] }),
      ]),
    );
  });
});
