import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('StellarTrust Screenshot Automation', () => {
  const screenshotsDir = path.resolve(__dirname, '../../../docs/screenshots');

  test('Capture all screenshots and generate markdown indexes', async ({ page }) => {
    test.setTimeout(120000);
    // 1. Ensure screenshot folder exists
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // 2. Setup dialog handler to automatically accept alerts during seeding
    page.on('dialog', async (dialog) => {
      console.log(`[Dialog Alert Accepted]: ${dialog.message()}`);
      await dialog.accept();
    });

    console.log('Navigating to validation page to seed audit logs...');
    // Open validation hub and click simulator button
    await page.goto('/admin/validation');
    await page.waitForLoadState('networkidle');
    const simulateButton = page.locator('button:has-text("Simulate 10+ Users Flow")');
    await expect(simulateButton).toBeVisible({ timeout: 10000 });
    await simulateButton.click();
    await page.waitForTimeout(1000); // Wait for storage write and UI reload

    console.log('Navigating to admin sandbox to seed general app data...');
    // Open admin sandbox and click mock database seeding
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    const seedButton = page.locator('button:has-text("Populate Mock Database")');
    await expect(seedButton).toBeVisible({ timeout: 10000 });
    await seedButton.click();
    await page.waitForTimeout(1000); // Wait for storage write and UI reload

    // Define views and routes to capture
    const pages = [
      { name: 'landing', path: '/' },
      { name: 'dashboard', path: '/dashboard' },
      { name: 'escrow', path: '/escrow' },
      { name: 'reputation', path: '/reputation' },
      { name: 'gallery', path: '/gallery' },
      { name: 'admin', path: '/admin' },
      { name: 'analytics', path: '/admin/validation' }
    ];

    const viewports = [
      { name: 'desktop', width: 1280, height: 800, isMobile: false },
      { name: 'mobile', width: 375, height: 812, isMobile: true }
    ];

    const capturedFiles: { name: string; file: string; viewport: string; path: string }[] = [];

    // Capture loop
    for (const view of viewports) {
      console.log(`Setting viewport for ${view.name} (${view.width}x${view.height})...`);
      await page.setViewportSize({ width: view.width, height: view.height });

      for (const p of pages) {
        console.log(`Capturing ${p.name} on ${view.name}...`);
        await page.goto(p.path);
        
        // Wait for page load and state stabilization
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Allow animations & charts to load/stabilize

        const fileName = `${p.name}_${view.name}.png`;
        const filePath = path.join(screenshotsDir, fileName);

        await page.screenshot({ path: filePath, fullPage: false });
        console.log(`Saved screenshot to ${filePath}`);

        capturedFiles.push({
          name: `${p.name.charAt(0).toUpperCase() + p.name.slice(1)} (${view.name})`,
          file: fileName,
          viewport: `${view.width}x${view.height}`,
          path: p.path
        });
      }
    }

    // 3. Generate screenshot index markdown
    const screenshotReadmePath = path.join(screenshotsDir, 'README.md');
    console.log(`Generating screenshot index at: ${screenshotReadmePath}`);

    const readmeContent = `# StellarTrust Automated Screenshots Showcase

This folder contains automatically generated screenshots of the StellarTrust application, captured using Playwright automation.

## 🖥️ Desktop Screenshots (1280x800)

| Page Name | View Route | Screenshot Link |
| :--- | :--- | :--- |
${capturedFiles
  .filter(f => f.file.includes('_desktop'))
  .map(f => `| **${f.name.replace(' (desktop)', '')}** | \`${f.path}\` | [View Image](${f.file}) |`)
  .join('\n')}

---

## 📱 Mobile Screenshots (375x812)

| Page Name | View Route | Screenshot Link |
| :--- | :--- | :--- |
${capturedFiles
  .filter(f => f.file.includes('_mobile'))
  .map(f => `| **${f.name.replace(' (mobile)', '')}** | \`${f.path}\` | [View Image](${f.file}) |`)
  .join('\n')}

---

*Generated automatically on ${new Date().toLocaleDateString()} by Playwright screenshots spec.*
`;

    fs.writeFileSync(screenshotReadmePath, readmeContent, 'utf8');

    // 4. Automatically update root README.md
    const rootReadmePath = path.resolve(__dirname, '../../../README.md');
    console.log(`Updating root README.md at: ${rootReadmePath}`);

    if (fs.existsSync(rootReadmePath)) {
      let rootReadmeContent = fs.readFileSync(rootReadmePath, 'utf8');

      const showcaseHeader = '## 📸 Screenshots Showcase';
      const showcaseSection = `
${showcaseHeader}

Below are the automated screenshots capturing the premium glassmorphic UI pages under both Desktop and Mobile viewports.

### 🖥️ Desktop Showcase

| Landing Page | Dashboard Board | Escrow Portal |
| :---: | :---: | :---: |
| ![Landing Page](docs/screenshots/landing_desktop.png) | ![Dashboard](docs/screenshots/dashboard_desktop.png) | ![Escrow Page](docs/screenshots/escrow_desktop.png) |

| Reputation Score | NFT Gallery Certificates | Admin Test Sandbox |
| :---: | :---: | :---: |
| ![Reputation](docs/screenshots/reputation_desktop.png) | ![NFT Gallery](docs/screenshots/gallery_desktop.png) | ![Admin Sandbox](docs/screenshots/admin_desktop.png) |

| Analytics Green Belt Validation |
| :---: |
| ![Analytics Hub](docs/screenshots/analytics_desktop.png) |

### 📱 Mobile Showcase

| Landing Page Mobile | Dashboard Mobile | Escrow Mobile |
| :---: | :---: | :---: |
| ![Landing Mobile](docs/screenshots/landing_mobile.png) | ![Dashboard Mobile](docs/screenshots/dashboard_mobile.png) | ![Escrow Mobile](docs/screenshots/escrow_mobile.png) |

For a complete index of all screenshots, check the [Screenshots Index](docs/screenshots/README.md).
`;

      // Remove existing screenshots showcase section if present
      if (rootReadmeContent.includes(showcaseHeader)) {
        const parts = rootReadmeContent.split(showcaseHeader);
        // We find where the next heading is, or cut it off
        const afterShowcase = parts[1];
        const nextHeadingIndex = afterShowcase.indexOf('\n## ');
        if (nextHeadingIndex !== -1) {
          rootReadmeContent = parts[0] + showcaseSection.trim() + '\n\n' + afterShowcase.substring(nextHeadingIndex);
        } else {
          rootReadmeContent = parts[0] + showcaseSection.trim();
        }
      } else {
        // Append to the end
        rootReadmeContent = rootReadmeContent.trim() + '\n\n' + showcaseSection.trim() + '\n';
      }

      fs.writeFileSync(rootReadmePath, rootReadmeContent, 'utf8');
      console.log('Root README.md successfully updated with screenshot showcase references!');
    } else {
      console.warn('Root README.md not found!');
    }
  });
});
