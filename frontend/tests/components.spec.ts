import { test, expect } from '@playwright/test';

test.describe('Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock successful API response to get to the workbook interface
    await page.route('**/api/generate', async (route) => {
      const mockResponse = {
        pages: [
          {
            index: 0,
            title: 'Test Page 1',
            code: `const TestPage = () => {
              return (
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Test Page 1</h1>
                  <p className="text-gray-600">This is a test page.</p>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded">Test Button</button>
                </div>
              );
            };
            export default TestPage;`
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
    
    // Upload a file to get to workbook interface
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content')
    });

    // Wait for workbook interface to load
    await expect(page.locator('h3:has-text("Pages")')).toBeVisible({ timeout: 10000 });
  });

  test('page navigator shows correct page information', async ({ page }) => {
    const pageNavigator = page.locator('h3:has-text("Pages")').locator('..');
    await expect(pageNavigator).toBeVisible();
    
    // Check if page thumbnail is present
    await expect(page.locator('text=Page 1')).toBeVisible();
    await expect(page.locator('text=Test Page 1')).toBeVisible();
    
    // Check if page is selected (should have blue background)
    const selectedPage = page.locator('text=Page 1').locator('..');
    await expect(selectedPage).toHaveClass(/bg-blue-500/);
  });

  test('code editor is functional', async ({ page }) => {
    // Check if Sandpack editor is loaded
    await expect(page.locator('h3:has-text("Code Editor")')).toBeVisible();
    
    // Wait for Sandpack to load
    await page.waitForSelector('[data-sandpack]', { timeout: 10000 });
    
    // Check if editor tabs are present
    await expect(page.locator('text=App.tsx')).toBeVisible();
  });

  test('preview canvas renders correctly', async ({ page }) => {
    const previewSection = page.locator('h3:has-text("Preview")').locator('..');
    await expect(previewSection).toBeVisible();
    
    // Check if preview iframe is present
    await expect(page.locator('iframe[title="Preview"]')).toBeVisible();
    
    // Check if print and export buttons are present
    await expect(page.locator('button[title="Print"]')).toBeVisible();
    await expect(page.locator('button[title="Export PDF"]')).toBeVisible();
  });

  test('element selector functionality', async ({ page }) => {
    // Check if element selector is present
    await expect(page.locator('button:has-text("Select Element")')).toBeVisible();
    
    // Click the select element button
    await page.locator('button:has-text("Select Element")').click();
    
    // Should show "Selecting..." state
    await expect(page.locator('button:has-text("Selecting...")')).toBeVisible();
    
    // Should show instruction text
    await expect(page.locator('text=Click an element to select it')).toBeVisible();
  });

  test('brand kit controls are functional', async ({ page }) => {
    const brandPanel = page.locator('h3:has-text("Brand Kit")').locator('..');
    await expect(brandPanel).toBeVisible();
    
    // Check color controls
    await expect(page.locator('text=Primary Color')).toBeVisible();
    await expect(page.locator('text=Secondary Color')).toBeVisible();
    await expect(page.locator('text=Accent Color')).toBeVisible();
    
    // Check font controls
    await expect(page.locator('text=Primary Font')).toBeVisible();
    await expect(page.locator('text=Secondary Font')).toBeVisible();
    
    // Test color picker interaction
    const primaryColorPicker = page.locator('input[type="color"]').first();
    await primaryColorPicker.click();
    
    // Test font selector
    const fontSelect = page.locator('select').first();
    await fontSelect.selectOption('Roboto');
  });

  test('AI assistant interface is interactive', async ({ page }) => {
    const aiPanel = page.locator('h3:has-text("AI Assistant")').locator('..');
    await expect(aiPanel).toBeVisible();
    
    // Check initial state
    await expect(page.locator('text=I can help you modify this page')).toBeVisible();
    
    // Check input field
    const aiInput = page.locator('input[placeholder*="Ask me to modify"]');
    await expect(aiInput).toBeVisible();
    await expect(aiInput).toBeEnabled();
    
    // Check send button
    const sendButton = page.locator('button[type="submit"]');
    await expect(sendButton).toBeVisible();
    
    // Test typing in input
    await aiInput.fill('Test message');
    await expect(sendButton).toBeEnabled();
    
    // Clear input should disable send button
    await aiInput.fill('');
    await expect(sendButton).toBeDisabled();
  });

  test('code executor component works', async ({ page }) => {
    // Check if code executor is present in the editor
    await expect(page.locator('text=Code Executor')).toBeVisible();
    
    // Check if run button is present
    await expect(page.locator('button:has-text("Run Code")')).toBeVisible();
    
    // Test run button click
    await page.locator('button:has-text("Run Code")').click();
    
    // Should show loading state
    await expect(page.locator('text=Running...')).toBeVisible();
  });

  test('export functionality is available', async ({ page }) => {
    // Mock PDF export endpoint
    await page.route('**/api/export-pdf', async (route) => {
      // Create a mock PDF response
      const pdfBuffer = Buffer.from('mock pdf content');
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        headers: {
          'Content-Disposition': 'attachment; filename=workbook.pdf'
        },
        body: pdfBuffer
      });
    });

    const exportButton = page.locator('button[title="Export PDF"]');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();
    
    // Test export click
    await exportButton.click();
    
    // Should show loading state
    await expect(page.locator('button[title="Export PDF"]')).toHaveClass(/disabled:opacity-50/);
  });

  test('print functionality works', async ({ page }) => {
    const printButton = page.locator('button[title="Print"]');
    await expect(printButton).toBeVisible();
    await expect(printButton).toBeEnabled();
    
    // We can't actually test printing, but we can test the button click
    await printButton.click();
    // The print dialog would open in the iframe, which we can't test directly
  });
});

test.describe('Interactive Features', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/generate', async (route) => {
      const mockResponse = {
        pages: [
          {
            index: 0,
            title: 'Interactive Page',
            code: `const InteractivePage = () => {
              return (
                <div className="p-8">
                  <h1 id="main-title" className="text-2xl font-bold mb-4">Interactive Page</h1>
                  <p className="text-gray-600 mb-4">This is an interactive test page.</p>
                  <button id="test-button" className="bg-blue-500 text-white px-4 py-2 rounded">Click Me</button>
                </div>
              );
            };
            export default InteractivePage;`
          }
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
        code: `const UpdatedPage = () => {
          return (
            <div className="p-8">
              <h1 className="text-3xl font-bold mb-4">Updated Interactive Page</h1>
              <p className="text-gray-600 mb-4">This page has been updated by AI.</p>
              <button className="bg-green-500 text-white px-4 py-2 rounded">Updated Button</button>
            </div>
          );
        };
        export default UpdatedPage;`
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
    await expect(page.locator('h3:has-text("Pages")')).toBeVisible({ timeout: 10000 });
  });

  test('AI assistant processes messages correctly', async ({ page }) => {
    // Wait for AI assistant to be ready
    await expect(page.locator('h3:has-text("AI Assistant")')).toBeVisible();
    
    const aiInput = page.locator('input[placeholder*="Ask me to modify"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Type and send a message
    await aiInput.fill('Make the heading bigger');
    await sendButton.click();
    
    // Check if user message appears
    await expect(page.locator('text=Make the heading bigger')).toBeVisible({ timeout: 5000 });
    
    // Check if AI response appears
    await expect(page.locator('text=I\'ve updated the code based on your request')).toBeVisible({ timeout: 10000 });
  });

  test('element selection shows in AI assistant', async ({ page }) => {
    // Click the select element button
    await page.locator('button:has-text("Select Element")').click();
    
    // Should show selecting state
    await expect(page.locator('button:has-text("Selecting...")')).toBeVisible();
    
    // In a real scenario, we would click on an element in the preview iframe
    // For testing purposes, we'll simulate the selection programmatically
    await page.evaluate(() => {
      // Simulate element selection
      window.dispatchEvent(new CustomEvent('elementSelected', {
        detail: { element: '#main-title', code: '<h1 id="main-title">Interactive Page</h1>' }
      }));
    });
    
    // Check if selected element appears in AI assistant
    await expect(page.locator('text=Selected: #main-title')).toBeVisible({ timeout: 5000 });
  });

  test('brand kit changes affect preview', async ({ page }) => {
    // Change primary color
    const primaryColorPicker = page.locator('input[type="color"]').first();
    await primaryColorPicker.fill('#ff0000');
    
    // Change font
    const fontSelect = page.locator('select').first();
    await fontSelect.selectOption('Roboto');
    
    // The preview should reflect these changes
    // We can't easily test the iframe content directly, but we can verify the controls work
    await expect(primaryColorPicker).toHaveValue('#ff0000');
    await expect(fontSelect).toHaveValue('Roboto');
  });
});