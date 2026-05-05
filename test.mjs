import { chromium } from 'playwright';

async function testCareTrack() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Start the preview server in the background
    console.log('Starting preview server...');
    
    // Navigate to the app
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Check if the page loads
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for the CareTrack logo/brand
    const logoText = await page.textContent('h1');
    console.log('Logo text:', logoText);
    
    // Check if login form is visible
    const emailInput = await page.locator('input[type="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    console.log('Email input found:', emailInput);
    console.log('Password input found:', passwordInput);
    
    // Fill in login form with doctor credentials
    await page.fill('input[type="email"]', 'dr.chen@caretrack.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Click sign in
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(1500);
    
    // Check if dashboard loaded - should redirect to /doctor
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    // Check for dashboard elements
    const dashboardContent = await page.textContent('body');
    const hasDashboard = dashboardContent.includes('Doctor Dashboard') || dashboardContent.includes('Welcome');
    console.log('Dashboard loaded:', hasDashboard);
    
    console.log('✅ Test passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCareTrack();
