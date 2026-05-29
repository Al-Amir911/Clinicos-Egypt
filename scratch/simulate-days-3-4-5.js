const { chromium } = require('@playwright/test');
const readline = require('readline');

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

(async () => {
  console.log('============================================================');
  console.log('   ClinicOS - E2E Automated Simulation: Days 3, 4, and 5    ');
  console.log('============================================================\n');

  // Launch headful browser so the user can watch the automation
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // 1 second delay between actions
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(45000);

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
    const email = `doctor.days345.${timestamp}@example.com`;
    const clinicName = `عيادة الفحص والحسابات`;
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
    // DAY 3: Tuesday (InstaPay & Accounting)
    // ------------------------------------------------------------------------
    console.log('\n============================================================');
    console.log('   DAY 3: Tuesday (InstaPay & Accounting)                   ');
    console.log('============================================================');

    // 1. Add Patient A (Cash Payment)
    console.log('\nAdding Patient A (Cash)...');
    await page.click('button:has-text("إضافة مريض")');
    await page.waitForSelector('#phone');
    await page.type('#phone', '01011112222');
    await page.fill('#name', 'عبد الله الدفع نقدي');
    await page.click('button[type="submit"]:has-text("تأكيد وإضافة للطابور")');
    await page.waitForSelector('text=عبد الله الدفع نقدي');
    console.log('Patient A successfully added to the queue.');

    // 2. Add Patient B (InstaPay Payment)
    console.log('\nAdding Patient B (InstaPay)...');
    await page.click('button:has-text("إضافة مريض")');
    await page.waitForSelector('#phone');
    await page.type('#phone', '01022223333');
    await page.fill('#name', 'سليمان الدفع إنستاباي');
    await page.click('button[type="submit"]:has-text("تأكيد وإضافة للطابور")');
    await page.waitForSelector('text=سليمان الدفع إنستاباي');
    console.log('Patient B successfully added to the queue.');

    // 3. Complete Patient A for 300 EGP in Cash
    console.log('\nCompleting Patient A (Cash - 300 EGP)...');
    // Click "دخول للطبيب" (Go to Doctor) on Patient A card
    // Select based on card content containing patient name
    const cardA = page.locator('.overflow-hidden', { hasText: 'عبد الله الدفع نقدي' });
    await cardA.locator('button:has-text("دخول للطبيب")').click();
    await page.waitForTimeout(1000);
    // Click "إنهاء" (Finish)
    await cardA.locator('button:has-text("إنهاء")').click();
    
    // Fill Payment Modal
    await page.waitForSelector('#amount');
    await page.fill('#amount', '300');
    // Select method Cash
    await page.click('button[type="submit"]:has-text("تأكيد وإنهاء الكشف")');
    await page.waitForSelector('text=تم إنهاء الكشف وتسجيل الدفع بنجاح');
    console.log('Patient A payment of 300 Cash logged successfully.');

    // 4. Complete Patient B for 500 EGP via InstaPay
    console.log('\nCompleting Patient B (InstaPay - 500 EGP)...');
    const cardB = page.locator('.overflow-hidden', { hasText: 'سليمان الدفع إنستاباي' });
    await cardB.locator('button:has-text("دخول للطبيب")').click();
    await page.waitForTimeout(1000);
    await cardB.locator('button:has-text("إنهاء")').click();

    // Fill Payment Modal
    await page.waitForSelector('#amount');
    await page.fill('#amount', '500');
    // Select method InstaPay
    await page.click('button:has-text("نقدي (Cash)")'); // Click trigger to open select dropdown
    await page.click('text=إنستاباي (InstaPay)'); // Select InstaPay from dropdown
    await page.click('button[type="submit"]:has-text("تأكيد وإنهاء الكشف")');
    await page.waitForSelector('text=تم إنهاء الكشف وتسجيل الدفع بنجاح');
    console.log('Patient B payment of 500 InstaPay logged successfully.');

    // 5. Verify Daily Revenue Card calculations
    console.log('\nVerifying revenue statistics calculations in Summary Card...');
    await page.waitForTimeout(2000); // Wait for statistics update
    
    // Total Revenue
    await page.waitForSelector('text=800 ج.م');
    console.log('Total Daily Revenue correctly displays: 800 ج.م ✅');

    // Cash vs InstaPay Breakdown
    await page.waitForSelector('text=نقدي: 300');
    console.log('Cash Breakdown correctly displays: 300 ✅');
    
    await page.waitForSelector('text=إنستاباي: 500');
    console.log('InstaPay Breakdown correctly displays: 500 ✅');

    // ------------------------------------------------------------------------
    // DAY 4: Wednesday (Subscription Billing Warning)
    // ------------------------------------------------------------------------
    console.log('\n============================================================');
    console.log('   DAY 4: Wednesday (Subscription Billing Warning)          ');
    console.log('============================================================');
    console.log('\nTo simulate the subscription warning state (3 days remaining):');
    console.log('Please copy and run this query in your Supabase SQL Editor:');
    console.log(`\n    UPDATE clinics SET subscription_expires_at = NOW() + INTERVAL '3 days', subscription_status = 'active' WHERE name = '${clinicName}';\n`);

    await askQuestion('Once you have run the query in Supabase, press [Enter] here to continue the test...');

    console.log('Reloading dashboard to fetch updated subscription date...');
    await page.reload();
    await page.waitForSelector('text=طابور الانتظار');

    // Assert warning banner triggers
    console.log('Asserting warning banner triggers...');
    await page.waitForSelector('text=تنبيه: متبقي');
    await page.waitForSelector('text=3 أيام');
    console.log('Yellow warning banner triggers and shows remaining days correctly! ✅');

    // Click "دفع الآن" in banner
    console.log('Opening payment instructions dialog...');
    await page.click('button:has-text("دفع الآن")');
    await page.waitForSelector('text=تجديد اشتراك العيادة');

    // Check InstaPay ID and WhatsApp payment confirmation details
    console.log('Verifying secretary payment instructions...');
    const dialog = page.locator('div[role="dialog"]');
    await dialog.waitFor();
    
    const instapayIdText = await dialog.locator('text=01110203939').textContent();
    console.log(`InstaPay ID displayed clearly: "${instapayIdText}" ✅`);

    const waLink = await dialog.locator('a:has-text("إرسال صورة التحويل عبر واتساب")').getAttribute('href');
    console.log(`WhatsApp confirmation link: ${waLink}`);
    
    if (waLink.includes('201025110560') && waLink.includes(encodeURIComponent(clinicName))) {
      console.log('WhatsApp link contains correct number and dynamic clinic name! ✅');
    } else {
      console.error('WhatsApp link validation failed! ❌');
    }

    // Close Dialog
    await dialog.locator('button:has-text("إغلاق")').click();

    // ------------------------------------------------------------------------
    // DAY 5: Thursday (The Lockout & Reset)
    // ------------------------------------------------------------------------
    console.log('\n============================================================');
    console.log('   DAY 5: Thursday (The Lockout & Reset)                    ');
    console.log('============================================================');
    console.log('\nTo simulate the subscription lockout state (expired):');
    console.log('Please copy and run this query in your Supabase SQL Editor:');
    console.log(`\n    UPDATE clinics SET subscription_status = 'suspended' WHERE name = '${clinicName}';\n`);

    await askQuestion('Once you have run the query in Supabase, press [Enter] here to continue the test...');

    console.log('Reloading page to fetch updated subscription status...');
    await page.reload();

    // Assert dashboard locks
    console.log('Asserting dashboard locks and intercepts user layout...');
    await page.waitForSelector('text=انتهت صلاحية تفعيل الحساب');
    console.log('Dashboard paywall lock screen displayed successfully! ✅');

    // Check InstaPay ID is visible on Lock screen
    const lockInstaPayText = await page.locator('text=01110203939').textContent();
    console.log(`InstaPay ID visible on Lock screen: "${lockInstaPayText}" ✅`);

    // Reset subscription
    console.log('\nTo simulate the subscription renewal (unlocking):');
    console.log('Please copy and run this query in your Supabase SQL Editor:');
    console.log(`\n    UPDATE clinics SET subscription_status = 'active', subscription_expires_at = NOW() + INTERVAL '30 days' WHERE name = '${clinicName}';\n`);

    await askQuestion('Once you have run the query in Supabase, press [Enter] here to verify the reset...');

    // Click "تحديث الحالة" (Update Status)
    console.log('Clicking "تحديث الحالة" (Update Status) on the lock screen...');
    await page.click('button:has-text("تحديث الحالة")');

    // Assert dashboard unlocks
    console.log('Asserting dashboard instantly unlocks...');
    await page.waitForSelector('text=طابور الانتظار');
    console.log('Dashboard successfully unlocked and returned to normal queue list! ✅');

    console.log('\n============================================================');
    console.log('   All simulation steps completed successfully! 🎉');
    console.log('============================================================');

  } catch (error) {
    console.error('\n❌ Automation error occurred:', error);
  } finally {
    console.log('Leaving browser open for 5 seconds before closing...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();
