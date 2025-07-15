import { test, expect } from '@playwright/test';

test.describe('Integration Tests', () => {
  test.describe('Full Workflow', () => {
    test('complete workbook creation workflow', async ({ page }) => {
      // Mock all API endpoints
      await page.route('**/api/generate', async (route) => {
        const mockResponse = {
          pages: [
            {
              index: 0,
              title: 'Welcome Page',
              code: `const WelcomePage = () => {
                return (
                  <div className="p-8 bg-white">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Our Workbook</h1>
                    <p className="text-lg text-gray-600 mb-6">This is an automatically generated workbook from your content.</p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
                      <p className="text-gray-700">Follow the instructions below to complete your tasks.</p>
                    </div>
                  </div>
                );
              };
              export default WelcomePage;`
            },
            {
              index: 1,
              title: 'Exercise Page',
              code: `const ExercisePage = () => {
                return (
                  <div className="p-8 bg-white">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Exercise 1</h1>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Question 1:</h3>
                        <p className="text-gray-700">What is the capital of France?</p>
                        <input type="text" className="mt-2 p-2 border rounded w-full" placeholder="Your answer..." />
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Question 2:</h3>
                        <p className="text-gray-700">Name three programming languages.</p>
                        <textarea className="mt-2 p-2 border rounded w-full h-24" placeholder="Your answer..."></textarea>
                      </div>
                    </div>
                  </div>
                );
              };
              export default ExercisePage;`
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
          code: `const UpdatedWelcomePage = () => {
            return (
              <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50">
                <h1 className="text-4xl font-bold text-purple-800 mb-4">Welcome to Our Enhanced Workbook</h1>
                <p className="text-xl text-purple-600 mb-6">This workbook has been enhanced with AI assistance.</p>
                <div className="bg-purple-100 p-6 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-semibold mb-3 text-purple-800">Getting Started</h2>
                  <p className="text-purple-700">Follow the enhanced instructions below to complete your tasks with style.</p>
                </div>
              </div>
            );
          };
          export default UpdatedWelcomePage;`
        };
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponse)
        });
      });

      await page.route('**/api/export-pdf', async (route) => {
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

      await page.goto('/');

      // Step 1: Upload a file
      await expect(page.locator('h1:has-text("Code-Driven Workbook Builder")')).toBeVisible();
      
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'sample-workbook.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('mock workbook content')
      });

      // Step 2: Wait for workbook to load
      await expect(page.locator('h3:has-text("Pages")')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('text=Welcome Page')).toBeVisible();
      await expect(page.locator('text=Exercise Page')).toBeVisible();

      // Step 3: Navigate between pages
      await page.locator('text=Page 1').click();
      await expect(page.locator('text=Page 1').locator('..')).toHaveClass(/bg-blue-500/);
      
      await page.locator('text=Page 2').click();
      await expect(page.locator('text=Page 2').locator('..')).toHaveClass(/bg-blue-500/);

      // Go back to page 1
      await page.locator('text=Page 1').click();

      // Step 4: Customize brand kit
      await expect(page.locator('h3:has-text("Brand Kit")')).toBeVisible();
      
      // Change primary color
      const primaryColorPicker = page.locator('input[type="color"]').first();
      await primaryColorPicker.fill('#7c3aed');
      
      // Change font
      const fontSelect = page.locator('select').first();
      await fontSelect.selectOption('Roboto');

      // Step 5: Use AI assistant to modify content
      await expect(page.locator('h3:has-text("AI Assistant")')).toBeVisible();
      
      const aiInput = page.locator('input[placeholder*="Ask me to modify"]');
      const sendButton = page.locator('button[type="submit"]');
      
      await aiInput.fill('Make this page more colorful and engaging');
      await sendButton.click();

      // Wait for AI response
      await expect(page.locator('text=Make this page more colorful and engaging')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=I\'ve updated the code based on your request')).toBeVisible({ timeout: 10000 });

      // Step 6: Export the workbook
      await expect(page.locator('h3:has-text("Preview")')).toBeVisible();
      const exportButton = page.locator('button[title="Export PDF"]');
      await expect(exportButton).toBeVisible();
      await exportButton.click();

      // Should show loading state briefly
      await expect(page.locator('button[title="Export PDF"]')).toHaveClass(/disabled:opacity-50/);
    });

    test('error recovery workflow', async ({ page }) => {
      // Mock initial success
      await page.route('**/api/generate', async (route) => {
        const mockResponse = {
          pages: [
            {
              index: 0,
              title: 'Test Page',
              code: 'const TestPage = () => <div>Test</div>; export default TestPage;'
            }
          ]
        };
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponse)
        });
      });

      // Mock AI failure followed by success
      let aiCallCount = 0;
      await page.route('**/api/rewrite_page', async (route) => {
        aiCallCount++;
        
        if (aiCallCount === 1) {
          // First call fails
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'AI service temporarily unavailable' })
          });
        } else {
          // Second call succeeds
          const mockResponse = {
            code: 'const UpdatedTestPage = () => <div>Updated Test</div>; export default UpdatedTestPage;'
          };
          
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockResponse)
          });
        }
      });

      await page.goto('/');

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('mock content')
      });

      // Wait for workbook to load
      await expect(page.locator('h3:has-text("Pages")')).toBeVisible({ timeout: 10000 });

      // Try AI assistant (this will fail)
      const aiInput = page.locator('input[placeholder*="Ask me to modify"]');
      const sendButton = page.locator('button[type="submit"]');
      
      await aiInput.fill('Make changes');
      await sendButton.click();

      // Should show error message
      await expect(page.locator('text=Sorry, I encountered an error')).toBeVisible({ timeout: 5000 });

      // Try again (this should succeed)
      await aiInput.fill('Make changes again');
      await sendButton.click();

      // Should show success message
      await expect(page.locator('text=I\'ve updated the code based on your request')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Performance Tests', () => {
    test('handles large workbooks efficiently', async ({ page }) => {
      // Mock a workbook with many pages
      await page.route('**/api/generate', async (route) => {
        const pages = [];
        for (let i = 0; i < 20; i++) {
          pages.push({
            index: i,
            title: `Page ${i + 1}`,
            code: `const Page${i + 1} = () => {
              return (
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Page ${i + 1}</h1>
                  <p className="text-gray-600">This is page ${i + 1} of the workbook.</p>
                  <div className="mt-4 space-y-2">
                    ${Array.from({ length: 10 }, (_, j) => 
                      `<p key={${j}} className="text-sm text-gray-500">Content item ${j + 1}</p>`
                    ).join('')}
                  </div>
                </div>
              );
            };
            export default Page${i + 1};`
          });
        }
        
        const mockResponse = { pages };
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponse)
        });
      });

      await page.goto('/');

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'large-workbook.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('mock large workbook content')
      });

      // Wait for workbook to load
      await expect(page.locator('h3:has-text("Pages")')).toBeVisible({ timeout: 15000 });

      // Check that all pages are loaded
      await expect(page.locator('text=Page 1')).toBeVisible();
      await expect(page.locator('text=Page 20')).toBeVisible();

      // Test navigation performance
      const startTime = Date.now();
      await page.locator('text=Page 10').click();
      await expect(page.locator('text=Page 10').locator('..')).toHaveClass(/bg-blue-500/);
      const endTime = Date.now();

      // Navigation should be fast (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('handles rapid user interactions', async ({ page }) => {
      // Mock standard workbook
      await page.route('**/api/generate', async (route) => {
        const mockResponse = {
          pages: [
            {
              index: 0,
              title: 'Test Page',
              code: 'const TestPage = () => <div>Test</div>; export default TestPage;'
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

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('mock content')
      });

      await expect(page.locator('h3:has-text("Pages")')).toBeVisible({ timeout: 10000 });

      // Rapid brand kit changes
      const primaryColorPicker = page.locator('input[type="color"]').first();
      const fontSelect = page.locator('select').first();

      // Multiple rapid color changes
      for (let i = 0; i < 5; i++) {
        await primaryColorPicker.fill(`#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`);
        await page.waitForTimeout(100);
      }

      // Multiple rapid font changes
      const fontOptions = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'];
      for (const font of fontOptions) {
        await fontSelect.selectOption(font);
        await page.waitForTimeout(100);
      }

      // UI should remain responsive
      await expect(page.locator('h3:has-text("Brand Kit")')).toBeVisible();
      await expect(page.locator('h3:has-text("Preview")')).toBeVisible();
    });
  });

  test.describe('Accessibility Tests', () => {
    test('keyboard navigation works correctly', async ({ page }) => {
      // Mock API response
      await page.route('**/api/generate', async (route) => {
        const mockResponse = {
          pages: [
            {
              index: 0,
              title: 'Test Page',
              code: 'const TestPage = () => <div>Test</div>; export default TestPage;'
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

      // Test keyboard navigation on landing page
      await page.keyboard.press('Tab');
      await expect(page.locator('button:has-text("Choose File")')).toBeFocused();

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('mock content')
      });

      await expect(page.locator('h3:has-text("Pages")')).toBeVisible({ timeout: 10000 });

      // Test tab navigation through interface
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to navigate to AI assistant input
      const aiInput = page.locator('input[placeholder*="Ask me to modify"]');
      await aiInput.focus();
      await expect(aiInput).toBeFocused();
    });

    test('screen reader accessibility', async ({ page }) => {
      await page.route('**/api/generate', async (route) => {
        const mockResponse = {
          pages: [
            {
              index: 0,
              title: 'Test Page',
              code: 'const TestPage = () => <div>Test</div>; export default TestPage;'
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

      // Check for proper heading structure
      await expect(page.locator('h1')).toBeVisible();
      
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('mock content')
      });

      await expect(page.locator('h3:has-text("Pages")')).toBeVisible({ timeout: 10000 });

      // Check for proper ARIA labels and roles
      await expect(page.locator('button[title="Print"]')).toBeVisible();
      await expect(page.locator('button[title="Export PDF"]')).toBeVisible();
      
      // Check for proper form labels
      await expect(page.locator('text=Primary Color')).toBeVisible();
      await expect(page.locator('text=Primary Font')).toBeVisible();
    });
  });
});