const { chromium } = require('@playwright/test');

(async () => {
  console.log('============================================================');
  console.log('   ClinicOS - E2E Automated Simulation: The Power Outage    ');
  console.log('============================================================\n');

  // Launch headful browser so the user can watch the automation
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // 1 second delay between actions
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // Forward page console logs and errors to the terminal
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
    // Navigate to Login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/login');

    // Switch to Registration Tab
    console.log('Switching to signup tab (حساب جديد)...');
    await page.click('button[role="tab"]:has-text("حساب جديد")');

    // Fill signup form with randomized details to prevent email conflicts
    const timestamp = Date.now();
    const email = `test.doctor.${timestamp}@example.com`;
    console.log(`Filling out signup details for new doctor/clinic: ${email}`);
    await page.fill('#clinicName', 'عيادة السلام التخصصية');
    await page.fill('#doctorName', 'د. عمر سليمان');
    await page.fill('#fullName', 'عمر سليمان');
    await page.fill('#reg-email', email);
    await page.fill('#reg-password', 'Pass12345!');

    console.log('Submitting new clinic registration...');
    await page.click('button[type="submit"]:has-text("إنشاء الحساب")');

    // Wait for the main dashboard to load
    console.log('Waiting for redirection to the dashboard...');
    await page.waitForURL('http://localhost:3000/');
    await page.waitForSelector('text=طابور الانتظار');
    console.log('Dashboard successfully loaded! New clinic account is active.');

    // ------------------------------------------------------------------------
    // Step 1: Adding a patient online (Autofocus & Sanitization validation)
    // ------------------------------------------------------------------------
    console.log('\n--- Step 1: Adding a patient online ---');
    console.log('Opening "Add Patient" modal...');
    await page.click('button:has-text("إضافة مريض")');

    // Verify phone input is autofocused
    await page.waitForSelector('#phone');
    const isPhoneFocused = await page.evaluate(() => document.activeElement.id === 'phone');
    console.log(`Is the phone number input auto-focused? ${isPhoneFocused ? 'YES ✅' : 'NO ❌'}`);

    const patientPhone = '01122334455';
    const patientName = 'محمد عبد الرحمن';

    console.log(`Typing phone number with non-numeric characters to test sanitization: 011abc2233xy4455`);
    // Type with letters to ensure sanitization strips them
    await page.type('#phone', '011abc2233xy4455');

    const sanitizedValue = await page.inputValue('#phone');
    console.log(`Sanitized phone input value: "${sanitizedValue}" (expected: "${patientPhone}")`);
    if (sanitizedValue === patientPhone) {
      console.log('Phone input sanitization (only digits, max 11) verified successfully! ✅');
    } else {
      console.error('Phone input sanitization failed! ❌');
    }

    console.log(`Typing patient name: ${patientName}`);
    await page.fill('#name', patientName);

    console.log('Submitting the form...');
    await page.click('button[type="submit"]:has-text("تأكيد وإضافة للطابور")');

    // Verify success toast notification
    await page.waitForSelector('text=تمت إضافة المريض للطابور بنجاح');
    console.log('Success toast notification shown. ✅');

    // Verify patient is listed in the queue
    try {
      await page.waitForSelector(`text=${patientName}`, { timeout: 5000 });
      console.log(`Patient "${patientName}" successfully listed in the online queue! ✅`);
    } catch (e) {
      console.error(`❌ Timeout waiting for patient name "${patientName}". Let's inspect the page content:`);
      const queueListHtml = await page.innerHTML('.space-y-3');
      console.log('Queue container HTML:', queueListHtml);
      throw e;
    }

    // ------------------------------------------------------------------------
    // Step 2: Auto-filling existing patient by phone number
    // ------------------------------------------------------------------------
    console.log('\n--- Step 2: Auto-filling existing patient by phone number ---');
    console.log('Opening "Add Patient" modal again...');
    await page.click('button:has-text("إضافة مريض")');
    await page.waitForSelector('#phone');

    console.log(`Typing the same phone number: ${patientPhone}`);
    await page.type('#phone', patientPhone);

    console.log('Waiting for name lookup to automatically retrieve and populate the patient name...');
    // Wait for the name field to automatically fill with patientName
    await page.waitForFunction((expected) => document.querySelector('#name').value === expected, patientName, { timeout: 5000 });
    
    const autoFilledName = await page.inputValue('#name');
    console.log(`Auto-filled name in field: "${autoFilledName}" (expected: "${patientName}")`);
    if (autoFilledName === patientName) {
      console.log('Instant name lookup by phone number verified successfully! ✅');
    } else {
      console.error('Instant name lookup by phone number failed! ❌');
    }

    // Verify the database lookup toast message
    await page.waitForSelector('text=تم العثور على اسم المريض مسجلاً مسبقاً');
    console.log('Lookup success toast notification shown. ✅');

    // Change visit type to follow-up (إعادة)
    console.log('Changing visit type to follow-up (إعادة)...');
    await page.click('button:has-text("كشف جديد")');
    await page.click('text=إعادة');

    console.log('Submitting the follow-up...');
    await page.click('button[type="submit"]:has-text("تأكيد وإضافة للطابور")');

    // Verify that the queue count has updated to 2
    await page.waitForSelector('text=في الانتظار (2)');
    console.log('Follow-up successfully added to the queue! ✅');

    // ------------------------------------------------------------------------
    // Step 3: Simulating a Power Outage (Offline Mode)
    // ------------------------------------------------------------------------
    console.log('\n--- Step 3: Simulating a Power Outage (Offline Mode) ---');
    console.log('Setting browser network conditions to OFFLINE...');
    await context.setOffline(true);

    // Verify that the offline banner appears
    await page.waitForSelector('text=⚠️ تعمل الآن في وضع عدم الاتصال بالإنترنت (Offline Mode)');
    console.log('Offline yellow banner displayed at the top of the page. ✅');

    // Verify offline toast
    await page.waitForSelector('text=تم قطع الاتصال بالإنترنت. تعمل الآن في وضع عدم الاتصال.');
    console.log('Offline toast warning shown. ✅');

    console.log('Opening "Add Patient" modal while offline...');
    await page.click('button:has-text("إضافة مريض")');
    await page.waitForSelector('#phone');

    const offlinePhone = '01223344556';
    const offlineName = 'سامي يوسف (أوفلاين)';

    console.log(`Typing offline patient phone: ${offlinePhone}`);
    await page.type('#phone', offlinePhone);

    console.log(`Typing offline patient name: ${offlineName}`);
    await page.fill('#name', offlineName);

    console.log('Submitting form in offline mode...');
    await page.click('button[type="submit"]:has-text("تأكيد وإضافة للطابور")');

    // Verify local queue notification toast
    await page.waitForSelector('text=تم حفظ بيانات المريض محلياً. سيتم مزامنتها تلقائياً عند عودة الاتصال بالإنترنت.');
    console.log('Local/offline queuing notification toast verified! ✅');

    // Verify patient is listed in the UI queue even though offline
    await page.waitForSelector(`text=${offlineName}`);
    console.log('Offline patient visible in local queue list! ✅');

    // ------------------------------------------------------------------------
    // Step 4: Restoring Power (Online Mode) & Syncing
    // ------------------------------------------------------------------------
    console.log('\n--- Step 4: Restoring Power (Online Mode) & Syncing ---');
    console.log('Restoring network conditions to ONLINE...');
    await context.setOffline(false);

    // Verify reconnection toast
    await page.waitForSelector('text=تم إعادة الاتصال بالإنترنت بنجاح. جاري مزامنة البيانات...');
    console.log('Reconnection toast verified. ✅');

    // Verify sync completed successfully toast
    await page.waitForSelector('text=تمت مزامنة جميع التعديلات والمواعيد المحلية بنجاح.');
    console.log('Background sync successfully completed! Data pushed to Supabase. ✅');

    // Give it a moment to reload the queue
    await page.waitForTimeout(2000);

    // Verify synced patient is still present in the updated queue
    await page.waitForSelector(`text=${offlineName}`);
    console.log('Synced patient is still present in the updated queue. ✅');

    console.log('\n============================================================');
    console.log('   All simulation steps completed successfully! 🎉');
    console.log('============================================================');

  } catch (error) {
    console.error('\n❌ Automation error occurred:', error);
  } finally {
    // Keep browser open for a few seconds so the user can inspect the final dashboard
    console.log('Leaving browser open for 5 seconds before closing...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();
