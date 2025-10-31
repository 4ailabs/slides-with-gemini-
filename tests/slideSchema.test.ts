import { describe, it, expect } from 'vitest';
import { slideSchema, fontSettingsSchema, savedPresentationSchema, themeNameSchema } from '../schemas/slideSchema';
import { Slide, FontSettings, SavedPresentation } from '../types';

describe('slideSchema', () => {
  it('should validate a valid slide', () => {
    const validSlide: Slide = {
      title: 'Test Slide',
      content: ['Point 1', 'Point 2'],
      layout: 'text-only',
    };

    const result = slideSchema.safeParse(validSlide);
    expect(result.success).toBe(true);
  });

  it('should reject slide with empty title', () => {
    const invalidSlide: any = {
      title: '',
      content: ['Point 1'],
      layout: 'text-only',
    };

    const result = slideSchema.safeParse(invalidSlide);
    expect(result.success).toBe(false);
  });

  it('should reject slide with title too long', () => {
    const invalidSlide: any = {
      title: 'A'.repeat(201),
      content: ['Point 1'],
      layout: 'text-only',
    };

    const result = slideSchema.safeParse(invalidSlide);
    expect(result.success).toBe(false);
  });

  it('should reject slide with too many content points', () => {
    const invalidSlide: any = {
      title: 'Test',
      content: Array(21).fill('Point'),
      layout: 'text-only',
    };

    const result = slideSchema.safeParse(invalidSlide);
    expect(result.success).toBe(false);
  });

  it('should validate slide with imageUrl', () => {
    const validSlide: Slide = {
      title: 'Test Slide',
      content: ['Point 1'],
      layout: 'text-image',
      imageUrl: 'https://example.com/image.png',
    };

    const result = slideSchema.safeParse(validSlide);
    expect(result.success).toBe(true);
  });

  it('should validate slide with data URI imageUrl', () => {
    const validSlide: Slide = {
      title: 'Test Slide',
      content: ['Point 1'],
      layout: 'text-image',
      imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANS',
    };

    const result = slideSchema.safeParse(validSlide);
    expect(result.success).toBe(true);
  });
});

describe('fontSettingsSchema', () => {
  it('should validate valid font settings', () => {
    const validSettings: FontSettings = {
      fontFamily: 'Roboto',
      titleSize: 'large',
      contentSize: 'medium',
    };

    const result = fontSettingsSchema.safeParse(validSettings);
    expect(result.success).toBe(true);
  });

  it('should validate font settings with xlarge title', () => {
    const validSettings: FontSettings = {
      fontFamily: 'Roboto',
      titleSize: 'xlarge',
      contentSize: 'large',
    };

    const result = fontSettingsSchema.safeParse(validSettings);
    expect(result.success).toBe(true);
  });

  it('should reject contentSize with xlarge', () => {
    const invalidSettings: any = {
      fontFamily: 'Roboto',
      titleSize: 'large',
      contentSize: 'xlarge', // xlarge no está permitido para contentSize
    };

    const result = fontSettingsSchema.safeParse(invalidSettings);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Verificar que el error es sobre contentSize
      const errorMessage = JSON.stringify(result.error);
      expect(errorMessage).toContain('contentSize');
    }
  });

  it('should reject invalid font family', () => {
    const invalidSettings: any = {
      fontFamily: 'InvalidFont',
      titleSize: 'large',
      contentSize: 'medium',
    };

    const result = fontSettingsSchema.safeParse(invalidSettings);
    expect(result.success).toBe(false);
  });

  it('should reject invalid titleSize', () => {
    const invalidSettings: any = {
      fontFamily: 'Roboto',
      titleSize: 'invalid',
      contentSize: 'medium',
    };

    const result = fontSettingsSchema.safeParse(invalidSettings);
    expect(result.success).toBe(false);
  });

  it('should reject invalid contentSize', () => {
    const invalidSettings: any = {
      fontFamily: 'Roboto',
      titleSize: 'large',
      contentSize: 'invalid',
    };

    const result = fontSettingsSchema.safeParse(invalidSettings);
    expect(result.success).toBe(false);
  });
});

describe('themeNameSchema', () => {
  it('should validate all valid theme names', () => {
    const validThemes = ['purple-pink', 'blue-cyan', 'green-emerald', 'orange-red', 'dark-minimal'];
    
    validThemes.forEach(theme => {
      const result = themeNameSchema.safeParse(theme);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid theme names', () => {
    const invalidThemes = ['ocean', 'forest', 'sunset', 'night', 'fire', 'ocean-dark', 'forest-dark', 'invalid-theme'];
    
    invalidThemes.forEach(theme => {
      const result = themeNameSchema.safeParse(theme);
      expect(result.success).toBe(false);
    });
  });
});

describe('savedPresentationSchema', () => {
  it('should validate a valid saved presentation', () => {
    const validPresentation: SavedPresentation = {
      id: 'pres_123',
      name: 'My Presentation',
      slides: [
        {
          title: 'Slide 1',
          content: ['Point 1'],
          layout: 'text-only',
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = savedPresentationSchema.safeParse(validPresentation);
    expect(result.success).toBe(true);
  });

  it('should reject presentation with empty name', () => {
    const invalidPresentation: any = {
      id: 'pres_123',
      name: '',
      slides: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = savedPresentationSchema.safeParse(invalidPresentation);
    expect(result.success).toBe(false);
  });
});

