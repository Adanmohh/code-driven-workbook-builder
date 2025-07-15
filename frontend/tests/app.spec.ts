import { test, expect } from '@playwright/test';

test.describe('Code-Driven Workbook Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays the landing page correctly', async ({ page }) => {
    // Check if the main heading is present
    await expect(page.locator('h1')).toContainText('Code-Driven Workbook Builder');
    
    // Check if the upload area is present
    await expect(page.locator('text=Upload a PDF or image to create an editable workbook')).toBeVisible();
    
    // Check if the file upload component is present
    await expect(page.locator('text=Choose File')).toBeVisible();
  });

  test('shows drag and drop functionality', async ({ page }) => {
    const uploadArea = page.locator('div[role="button"]').first();
    await expect(uploadArea).toBeVisible();
    
    // Check for drag and drop text
    await expect(page.locator('text=Drag and drop your file here')).toBeVisible();
    
    // Check for supported file types
    await expect(page.locator('text=Supports PDF, PNG, JPG, JPEG')).toBeVisible();
  });

  test('file upload button is clickable', async ({ page }) => {
    const uploadButton = page.locator('button:has-text("Choose File")');
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toBeEnabled();
  });

  test('responsive design works correctly', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Workbook Interface', () => {
  test('mock workbook interface', async ({ page }) => {
    // Mock the API response for file upload
    await page.route('**/api/generate', async (route) => {
      const mockResponse = {
        pages: [
          {
            index: 0,
            title: 'Test Page 1',
            code: `
              const TestPage = () => {
                return (
                  <div className="p-8">
                    <h1 className="text-2xl font-bold mb-4">Test Page 1</h1>
                    <p className="text-gray-600">This is a test page generated from mock data.</p>
                  </div>
                );
              };
              
              export default TestPage;
            `
          },
          {
            index: 1,
            title: 'Test Page 2',
            code: `
              const TestPage = () => {
                return (
                  <div className="p-8">
                    <h1 className="text-2xl font-bold mb-4">Test Page 2</h1>
                    <p className="text-gray-600">This is another test page.</p>
                  </div>
                );
              };
              
              export default TestPage;
            `
          }
        ]
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });

    await page.goto('/');
    
    // Create a mock file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content')
    });

    // Wait for the workbook interface to load
    await expect(page.locator('h3:has-text("Pages")')).toBeVisible({ timeout: 10000 });
    
    // Check if page navigator is present
    await expect(page.locator('text=Page 1')).toBeVisible();
    await expect(page.locator('text=Page 2')).toBeVisible();
    
    // Check if code editor is present
    await expect(page.locator('h3:has-text("Code Editor")')).toBeVisible();
    
    // Check if preview canvas is present
    await expect(page.locator('h3:has-text("Preview")')).toBeVisible();
    
    // Check if brand kit panel is present
    await expect(page.locator('h3:has-text("Brand Kit")')).toBeVisible();
    
    // Check if AI assistant is present
    await expect(page.locator('h3:has-text("AI Assistant")')).toBeVisible();
  });

  test('page navigation works', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/generate', async (route) => {
      const mockResponse = {
        pages: [
          { index: 0, title: 'Page 1', code: 'const Page1 = () => <div>Page 1</div>;' },
          { index: 1, title: 'Page 2', code: 'const Page2 = () => <div>Page 2</div>;' }
        ]
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });

    await page.goto('/');
    
    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content')
    });

    // Wait for interface to load
    await expect(page.locator('text=Page 1')).toBeVisible({ timeout: 10000 });
    
    // Click on Page 2
    await page.locator('text=Page 2').click();
    
    // Check if Page 2 is selected (should have different styling)
    await expect(page.locator('text=Page 2').locator('..')).toHaveClass(/bg-blue-500/);
  });

  test('brand kit controls work', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/generate', async (route) => {
      const mockResponse = {
        pages: [
          { index: 0, title: 'Page 1', code: 'const Page1 = () => <div>Page 1</div>;' }
        ]
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });

    await page.goto('/');
    
    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content')
    });

    // Wait for interface to load
    await expect(page.locator('h3:has-text("Brand Kit")')).toBeVisible({ timeout: 10000 });
    
    // Test color picker
    const primaryColorPicker = page.locator('input[type="color"]').first();
    await expect(primaryColorPicker).toBeVisible();
    
    // Test font selector
    const fontSelect = page.locator('select').first();
    await expect(fontSelect).toBeVisible();
    await fontSelect.selectOption('Roboto');
  });

  test('AI assistant interface works', async ({ page }) => {
    // Mock the API responses
    await page.route('**/api/generate', async (route) => {
      const mockResponse = {
        pages: [
          { index: 0, title: 'Page 1', code: 'const Page1 = () => <div>Page 1</div>;' }
        ]
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });

    await page.route('**/api/rewrite_page', async (route) => {
      const mockResponse = {
        code: 'const UpdatedPage = () => <div>Updated Page</div>;'
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });

    await page.goto('/');
    
    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content')
    });

    // Wait for interface to load
    await expect(page.locator('h3:has-text("AI Assistant")')).toBeVisible({ timeout: 10000 });
    
    // Test AI assistant input
    const aiInput = page.locator('input[placeholder*="Ask me to modify"]');
    await expect(aiInput).toBeVisible();
    
    // Type a message
    await aiInput.fill('Make the text bigger');
    
    // Send the message
    await page.locator('button[type="submit"]').click();
    
    // Check if the message appears
    await expect(page.locator('text=Make the text bigger')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Error Handling', () => {
  test('handles upload errors gracefully', async ({ page }) => {
    // Mock a failed API response
    await page.route('**/api/generate', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/');
    
    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content')
    });

    // Should show error message (alert or notification)
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Failed to process file');
      await dialog.accept();
    });
  });

  test('handles AI assistant errors gracefully', async ({ page }) => {
    // Mock successful file upload
    await page.route('**/api/generate', async (route) => {
      const mockResponse = {
        pages: [
          { index: 0, title: 'Page 1', code: 'const Page1 = () => <div>Page 1</div>;' }
        ]
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });

    // Mock failed AI response
    await page.route('**/api/rewrite_page', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'AI service unavailable' })
      });
    });

    await page.goto('/');
    
    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content')
    });

    // Wait for interface to load
    await expect(page.locator('h3:has-text("AI Assistant")')).toBeVisible({ timeout: 10000 });
    
    // Try to use AI assistant
    const aiInput = page.locator('input[placeholder*="Ask me to modify"]');
    await aiInput.fill('Make the text bigger');
    await page.locator('button[type="submit"]').click();
    
    // Should show error message
    await expect(page.locator('text=Sorry, I encountered an error')).toBeVisible({ timeout: 5000 });
  });
});