const { chromium } = require('@playwright/test');

(async () => {
  console.log('============================================================');
  console.log('   ClinicOS - E2E Automated Simulation: Day 3 (Accounting)  ');
  console.log('============================================================\n');

  // Launch headful browser so the user can watch the automation
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1200 // Slow down actions so they are easy to follow
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // Forward browser console logs to Node terminal
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning' || type === 'log') {
      console.log(`[PAGE ${type.toUpperCase()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.error('[PAGE ERROR]', err.message);
  });

  try {
    // ------------------------------------------------------------------------
    // SETUP: Sign up a brand new doctor/clinic
    // ------------------------------------------------------------------------
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/login');

    console.log('Switching to signup tab (حساب جديد)...');
    await page.click('button[role="tab"]:has-text("حساب جديد")');

    const timestamp = Date.now();
    const email = `doctor.day3.${timestamp}@example.com`;
    const clinicName = `عيادة السلام التخصصية ${timestamp}`;
    console.log(`Creating new account with clinic: "${clinicName}" and email: ${email}`);
    await page.fill('#clinicName', clinicName);
    await page.fill('#doctorName', 'د. يوسف شريف');
    await page.fill('#fullName', 'يوسف شريف');
    await page.fill('#reg-email', email);
    await page.fill('#reg-password', 'Pass12345!');

    console.log('Submitting signup registration...');
    await page.click('button[type="submit"]:has-text("إنشاء الحساب")');

    console.log('Waiting for redirection to the dashboard...');
    await page.waitForURL('http://localhost:3000/');
    await page.waitForSelector('text=طابور الانتظار');
    console.log('Dashboard successfully loaded! New clinic account is active.');

    // ------------------------------------------------------------------------
    // DAY 3 Scenario: Cash & InstaPay Accounting
    // ------------------------------------------------------------------------
    
    // 1. Add Patient A (Cash Payment)
    console.log('\n--- Step 1: Adding Patient A (Cash) ---');
    await page.click('button:has-text("إضافة مريض")');
    await page.waitForSelector('#phone');
    await page.type('#phone', '01011112222');
    await page.fill('#name', 'عبد الله الدفع نقدي');
    await page.click('button[type="submit"]:has-text("تأكيد وإضافة للطابور")');
    await page.waitForSelector('text=عبد الله الدفع نقدي');
    console.log('Patient A successfully added to the queue.');

    // 2. Add Patient B (InstaPay Payment)
    console.log('\n--- Step 2: Adding Patient B (InstaPay) ---');
    await page.click('button:has-text("إضافة مريض")');
    await page.waitForSelector('#phone');
    await page.type('#phone', '01022223333');
    await page.fill('#name', 'سليمان الدفع إنستاباي');
    await page.click('button[type="submit"]:has-text("تأكيد وإضافة للطابور")');
    await page.waitForSelector('text=سليمان الدفع إنستاباي');
    console.log('Patient B successfully added to the queue.');

    // 3. Complete Patient A for 300 EGP in Cash
    console.log('\n--- Step 3: Completing Patient A (Cash - 300 EGP) ---');
    const cardA = page.locator('.overflow-hidden', { hasText: 'عبد الله الدفع نقدي' });
    await cardA.locator('button:has-text("دخول للطبيب")').click();
    await page.waitForTimeout(1000);
    await cardA.locator('button:has-text("إنهاء")').click();
    
    // Fill Payment Modal
    await page.waitForSelector('#amount');
    await page.fill('#amount', '300');
    // Confirm Cash
    await page.click('button[type="submit"]:has-text("تأكيد وإنهاء الكشف")');
    await page.waitForSelector('text=تم إنهاء الكشف وتسجيل الدفع بنجاح');
    console.log('Patient A payment of 300 Cash logged successfully.');

    // 4. Complete Patient B for 500 EGP via InstaPay
    console.log('\n--- Step 4: Completing Patient B (InstaPay - 500 EGP) ---');
    const cardB = page.locator('.overflow-hidden', { hasText: 'سليمان الدفع إنستاباي' });
    await cardB.locator('button:has-text("دخول للطبيب")').click();
    await page.waitForTimeout(1000);
    await cardB.locator('button:has-text("إنهاء")').click();

    // Fill Payment Modal
    await page.waitForSelector('#amount');
    await page.fill('#amount', '500');
    // Open select dropdown and change method to InstaPay
    await page.click('button:has-text("نقدي (Cash)")');
    await page.click('text=إنستاباي (InstaPay)');
    // Confirm payment
    await page.click('button[type="submit"]:has-text("تأكيد وإنهاء الكشف")');
    await page.waitForSelector('text=تم إنهاء الكشف وتسجيل الدفع بنجاح');
    console.log('Patient B payment of 500 InstaPay logged successfully.');

    // 5. Verify Daily Revenue Card calculations
    console.log('\n--- Step 5: Verifying Revenue Card Calculations ---');
    try {
      await page.waitForTimeout(2000); // Give the dashboard numbers a moment to refresh
      
      // Check Total Revenue
      await page.waitForSelector('text=800 ج.م', { timeout: 20000 });
      console.log('Total Daily Revenue correctly displays: 800 ج.م ✅');

      // Check Cash breakdown
      await page.waitForSelector('text=نقدي: 300', { timeout: 20000 });
      console.log('Cash Breakdown correctly displays: 300 ✅');
      
      // Check InstaPay breakdown
      await page.waitForSelector('text=إنستاباي: 500', { timeout: 20000 });
      console.log('InstaPay Breakdown correctly displays: 500 ✅');
    } catch (e) {
      console.error('❌ Failed to verify revenue cards. Summary cards HTML content:');
      const cardsHtml = await page.innerHTML('.grid');
      console.log(cardsHtml);
      throw e;
    }

    console.log('\n============================================================');
    console.log('   Day 3 simulation completed successfully! 🎉              ');
    console.log('============================================================');

  } catch (error) {
    console.error('\n❌ Automation error occurred:', error);
  } finally {
    console.log('Leaving browser open for 7 seconds before closing...');
    await page.waitForTimeout(7000);
    await browser.close();
  }
})();
